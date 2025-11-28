'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    params: { type: 'announcement' },
                };
                const res = await axios.get('http://localhost:5000/api/content', config);
                setAnnouncements(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        if (user) {
            fetchAnnouncements();
        }
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Upcoming Classes</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">New Assignments</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Events This Week</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Announcements</h2>
                <div className="bg-white rounded-lg shadow p-6">
                    {announcements.length === 0 ? (
                        <p className="text-gray-500">No announcements yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {announcements.map((item) => (
                                <li key={item._id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <h4 className="font-bold text-lg text-blue-600">{item.title}</h4>
                                    <p className="text-gray-600 mt-1">{item.description}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">
                                        Posted on {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
