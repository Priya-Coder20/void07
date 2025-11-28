'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { FileText, Download } from 'lucide-react';

interface MaterialItem {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    createdAt: string;
    uploadedBy: {
        name: string;
    };
}

export default function StudentMaterials() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    params: { type: 'material' },
                };
                const res = await axios.get('http://localhost:5000/api/content', config);
                setMaterials(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Study Materials</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {materials.length === 0 ? (
                    <p className="text-gray-500">No study materials uploaded yet.</p>
                ) : (
                    materials.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-4 text-sm">{item.description}</p>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400">By {item.uploadedBy?.name}</span>
                                <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    <Download size={16} />
                                    <span>Access Resource</span>
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
