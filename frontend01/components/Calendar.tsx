'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    events: { scheduledDate?: string | Date }[];
    onDateSelect: (date: Date) => void;
}

export default function Calendar({ events, onDateSelect }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        onDateSelect(newDate);
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const hasEvent = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return events.some((event) => {
            if (!event.scheduledDate) return false;
            const eventDate = new Date(event.scheduledDate);
            return isSameDay(eventDate, checkDate);
        });
    };

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        // Empty cells for days before the 1st
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-full w-full min-h-0"></div>);
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = isSameDay(dateToCheck, selectedDate);
            const isToday = isSameDay(dateToCheck, new Date());
            const dayHasEvent = hasEvent(day);
            const isPast = dateToCheck < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-full w-full min-h-0 border border-gray-100 flex flex-col items-start justify-start p-1 lg:p-2 transition-colors relative overflow-hidden
                        ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                        ${isPast ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-700'}
                        ${isToday ? 'font-bold text-blue-600' : ''}
                    `}
                >
                    <span className={`text-xs lg:text-sm ${isToday ? 'bg-blue-100 px-1.5 py-0.5 rounded-full' : ''}`}>{day}</span>
                    {dayHasEvent && (
                        <div className="mt-1 w-full flex justify-center">
                            <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
                        </div>
                    )}
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-lg shadow h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 text-center border-b flex-shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 flex-grow min-h-0">
                {renderDays()}
            </div>
        </div>
    );
}
