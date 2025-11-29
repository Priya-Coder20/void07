'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Calendar from '@/components/Calendar';
import EventList from '@/components/EventList';
import EventModal from '@/components/EventModal';
import EventDetailsModal from '@/components/EventDetailsModal';
import { Calendar as CalendarIcon } from 'lucide-react';

interface ScheduleItem {
    _id: string;
    title: string;
    description: string;
    fileUrl?: string;
    createdAt: string;
    scheduledDate?: string;
    eventType?: 'lecture' | 'quiz' | 'test';
    uploadedBy: {
        name: string;
    };
}

export default function StaffSchedule() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingEvent, setViewingEvent] = useState<ScheduleItem | null>(null);
    const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);

    const fetchSchedules = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                params: { type: 'schedule' },
            };
            const res = await axios.get('http://localhost:5000/api/content', config);
            setSchedules(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSchedules();
        }
    }, [user]);

    const handleCreate = async (data: any) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await axios.post('http://localhost:5000/api/content', {
                ...data,
                type: 'schedule',
            }, config);
            setIsModalOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error('Error creating schedule:', error);
            alert('Failed to create schedule');
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingEvent) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await axios.put(`http://localhost:5000/api/content/${editingEvent._id}`, data, config);
            setIsModalOpen(false);
            setEditingEvent(null);
            fetchSchedules();
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await axios.delete(`http://localhost:5000/api/content/${id}`, config);
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Failed to delete schedule');
        }
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const selectedDateEvents = schedules.filter((item) => {
        if (!item.scheduledDate) return false;
        return isSameDay(new Date(item.scheduledDate), selectedDate);
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-100px)]">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Manage Class Schedule
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                <div className="lg:col-span-1 h-full overflow-hidden">
                    <EventList
                        date={selectedDate}
                        events={selectedDateEvents}
                        isStaff={true}
                        onAdd={() => {
                            setEditingEvent(null);
                            setIsModalOpen(true);
                        }}
                        onEdit={(event) => {
                            setEditingEvent(event);
                            setIsModalOpen(true);
                        }}
                        onDelete={handleDelete}
                        onView={setViewingEvent}
                    />
                </div>

                <div className="lg:col-span-3 h-full">
                    <Calendar
                        events={schedules}
                        onDateSelect={setSelectedDate}
                    />
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEvent(null);
                }}
                onSubmit={editingEvent ? handleUpdate : handleCreate}
                initialData={editingEvent}
                selectedDate={selectedDate}
            />

            <EventDetailsModal
                isOpen={!!viewingEvent}
                onClose={() => setViewingEvent(null)}
                event={viewingEvent}
            />
        </div>
    );
}
