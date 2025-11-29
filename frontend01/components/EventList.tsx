'use client';

import React from 'react';
import { Clock, FileText, Edit2, Trash2, Plus } from 'lucide-react';

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

interface EventListProps {
    date: Date;
    events: ScheduleItem[];
    isStaff?: boolean;
    onAdd?: () => void;
    onEdit?: (event: ScheduleItem) => void;
    onDelete?: (id: string) => void;
    onView?: (event: ScheduleItem) => void;
}

export default function EventList({ date, events, isStaff, onAdd, onEdit, onDelete, onView }: EventListProps) {
    return (
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>
                {isStaff && onAdd && (
                    <button
                        onClick={onAdd}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Add Event"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events scheduled.</p>
                    </div>
                ) : (
                    events.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => onView && onView(item)}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:bg-blue-50/50"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide
                                    ${item.eventType === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                        item.eventType === 'test' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {item.eventType || 'Lecture'}
                                </span>
                                {isStaff && (
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item); }}
                                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item._id); }}
                                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.title}</h3>
                            <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
