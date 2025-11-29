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

    const [stats, setStats] = useState({
        upcomingClasses: 0,
        newAssignments: 0,
        eventsThisWeek: 0,
        rewardPoints: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                const res = await axios.get('http://localhost:5000/api/dashboard/student', config);
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching student stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

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

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">Upcoming Classes</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingClasses}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">New Assignments</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newAssignments}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">Events This Week</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.eventsThisWeek}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow text-white">
                        <h3 className="text-white/90 text-sm font-medium">Reward Points</h3>
                        <p className="text-3xl font-bold mt-2">{stats.rewardPoints || 0}</p>
                    </div>
                </div>
            )}

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
