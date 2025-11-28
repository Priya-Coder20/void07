'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Check, X } from 'lucide-react';

interface Booking {
    _id: string;
    resource: { name: string; type: string };
    user: { name: string };
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export default function ManageBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.get('http://localhost:5000/api/bookings', config);
            setBookings(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status }, config);
            fetchBookings();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Manage Bookings</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.resource?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{booking.user?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.date).toLocaleDateString()} <br />
                                    {booking.startTime} - {booking.endTime}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(booking._id, 'approved')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(booking._id, 'rejected')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
