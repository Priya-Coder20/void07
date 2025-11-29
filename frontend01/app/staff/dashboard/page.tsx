'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Request {
    _id: string;
    userEmail: string;
    resourceType: string;
    status: string;
    requestDate: string;
    duration: number;
    period: string;
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        myClasses: 0,
        pendingRequests: 0,
        materialsUploaded: 0,
    });
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };

                // Fetch Stats
                const statsRes = await axios.get('http://localhost:5000/api/dashboard/staff', config);
                setStats(statsRes.data);

                // Fetch Requests
                const bookingsRes = await axios.get('http://localhost:5000/api/bookings', config);
                // Assuming the API returns { pendingRequests: [], activeBookings: [] } for staff
                if (bookingsRes.data.pendingRequests) {
                    setRequests(bookingsRes.data.pendingRequests);
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status }, config);

            // Remove from list
            setRequests(prev => prev.filter(req => req._id !== id));

            // Update stats locally (optional)
            setStats(prev => ({ ...prev, pendingRequests: Math.max(0, prev.pendingRequests - 1) }));

            alert(`Request ${status}`);
        } catch (error) {
            console.error(`Error ${status} request:`, error);
            alert('Failed to update request');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Dashboard</h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">My Classes</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.myClasses}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingRequests}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm font-medium">Materials Uploaded</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.materialsUploaded}</p>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Requests</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-6 text-gray-500">No pending requests.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.userEmail}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.resourceType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.duration} {req.period}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleAction(req._id, 'approved')}
                                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(req._id, 'rejected')}
                                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 text-left">
                        <span className="font-semibold block">Upload Study Material</span>
                        <span className="text-sm opacity-75">Share notes and resources with students</span>
                    </button>
                    <button className="p-4 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100 text-left">
                        <span className="font-semibold block">Update Schedule</span>
                        <span className="text-sm opacity-75">Manage class timings and events</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
