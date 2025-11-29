'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    selectedDate?: Date;
}

export default function EventModal({ isOpen, onClose, onSubmit, initialData, selectedDate }: EventModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fileUrl: '',
        eventType: 'lecture',
        scheduledDate: '',
        targetAudience: 'student',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                fileUrl: initialData.fileUrl || '',
                eventType: initialData.eventType || 'lecture',
                scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
                targetAudience: 'student',
            });
        } else if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                fileUrl: '',
                eventType: 'lecture',
                scheduledDate: selectedDate.toISOString().split('T')[0]
            }));
        }
    }, [initialData, selectedDate, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Edit Event' : 'Add New Event'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                        <select
                            value={formData.eventType}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                        >
                            <option value="lecture">Lecture</option>
                            <option value="quiz">Quiz</option>
                            <option value="test">Test</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                        >
                            {initialData ? 'Update Event' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
