'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface ScheduleItem {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    createdAt: string;
    uploadedBy: {
        name: string;
    };
}

export default function StudentSchedule() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchSchedules();
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Schedule</h1>
            <div className="space-y-4">
                {schedules.length === 0 ? (
                    <p className="text-gray-500">No schedules uploaded yet.</p>
                ) : (
                    schedules.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                            <p className="text-gray-600 mt-2">{item.description}</p>
                            {item.fileUrl && (
                                <div className="mt-4">
                                    <a
                                        href={item.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        View Schedule Link/File
                                    </a>
                                </div>
                            )}
                            <div className="mt-4 text-sm text-gray-400 flex justify-between">
                                <span>Uploaded by: {item.uploadedBy?.name}</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
