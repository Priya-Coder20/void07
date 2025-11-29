'use client';

import React from 'react';
import { X, Calendar, FileText, User } from 'lucide-react';

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

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: ScheduleItem | null;
}

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide
                            ${event.eventType === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                event.eventType === 'test' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                            }`}>
                            {event.eventType || 'Lecture'}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {event.scheduledDate ? new Date(event.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No Date'}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        {event.fileUrl && (
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                <a
                                    href={event.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium break-all"
                                >
                                    View Attached Material
                                </a>
                            </div>
                        )}
                        <div className="flex items-center text-gray-500 text-sm">
                            <User className="w-5 h-5 text-gray-400 mr-2" />
                            <span>Uploaded by: <span className="font-medium text-gray-700">{event.uploadedBy?.name || 'Staff'}</span></span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
