'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';

interface Announcement {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function AdminAnnouncements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.post('http://localhost:5000/api/content', {
                ...formData,
                type: 'announcement',
                targetAudience: ['student', 'staff'],
            }, config);
            setMessage('Announcement posted successfully');
            setFormData({ title: '', description: '' });
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
            setMessage('Error posting announcement');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Post Announcement</h2>
                {message && <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            rows={3}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Post Announcement
                    </button>
                </form>
            </div>

            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Announcements</h2>
                <div className="space-y-4">
                    {announcements.map((item) => (
                        <div key={item._id} className="border-b pb-4 last:border-0 last:pb-0">
                            <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                            <p className="text-gray-600 mt-1">{item.description}</p>
                            <span className="text-xs text-gray-400 mt-2 block">
                                Posted on {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
