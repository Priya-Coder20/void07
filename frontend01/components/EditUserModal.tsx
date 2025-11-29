'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    year?: string;
    designation?: string;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
    userToEdit: User | null;
}

export default function EditUserModal({ isOpen, onClose, onUserUpdated, userToEdit }: EditUserModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        year: '',
        designation: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                department: userToEdit.department || '',
                year: userToEdit.year || '',
                designation: userToEdit.designation || '',
            });
            setErrors({});
            setApiError('');
        }
    }, [userToEdit]);

    if (!isOpen || !userToEdit) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (userToEdit.role === 'student') {
            if (!formData.department.trim()) newErrors.department = 'Department is required';
            if (!formData.year.trim()) newErrors.year = 'Year is required';
        }

        if (userToEdit.role === 'staff' || userToEdit.role === 'admin') {
            if (!formData.designation) newErrors.designation = 'Designation is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            await axios.put(`http://localhost:5000/api/users/${userToEdit._id}`, formData, config);

            onUserUpdated();
            onClose();
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Error updating user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit User</h2>

                {apiError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {userToEdit.role === 'student' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.department ? 'border-red-500' : ''}`}
                                />
                                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.year ? 'border-red-500' : ''}`}
                                />
                                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                            </div>
                        </div>
                    )}

                    {(userToEdit.role === 'staff' || userToEdit.role === 'admin') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <select
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.designation ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Designation</option>
                                <option value="Director">Director</option>
                                <option value="Assistant director">Assistant director</option>
                                <option value="Dean">Dean</option>
                                <option value="HoD">HoD</option>
                                <option value="Professor">Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Assistant">Assistant</option>
                            </select>
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update User'}
                    </button>
                </form>
            </div>
        </div>
    );
}
