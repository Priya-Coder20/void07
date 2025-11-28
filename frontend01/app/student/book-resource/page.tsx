'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Resource {
    _id: string;
    name: string;
    type: string;
    status: string;
}

export default function BookResource() {
    const { user } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [formData, setFormData] = useState({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                const res = await axios.get('http://localhost:5000/api/bookings/resources', config);
                setResources(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchResources();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.post('http://localhost:5000/api/bookings', formData, config);
            setMessage('Booking request sent successfully');
            setFormData({ resourceId: '', date: '', startTime: '', endTime: '' });
        } catch (error) {
            console.error(error);
            setMessage('Error sending booking request');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Book a Resource</h2>
            {message && <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Resource</label>
                    <select
                        value={formData.resourceId}
                        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    >
                        <option value="">Select Resource</option>
                        {resources.map((res) => (
                            <option key={res._id} value={res._id}>
                                {res.name} ({res.type})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">End Time</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Request Booking
                </button>
            </form>
        </div>
    );
}
