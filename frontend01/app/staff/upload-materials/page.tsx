'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function UploadMaterials() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fileUrl: '',
        targetAudience: 'student',
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await axios.post('http://localhost:5000/api/content', {
                ...formData,
                type: 'material',
            }, config);
            setMessage('Material uploaded successfully');
            setFormData({ title: '', description: '', fileUrl: '', targetAudience: 'student' });
        } catch (error) {
            console.error(error);
            setMessage('Error uploading material');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Study Material</h2>
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
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">File URL</label>
                    <input
                        type="text"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Link to document/resource"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Upload Material
                </button>
            </form>
        </div>
    );
}
