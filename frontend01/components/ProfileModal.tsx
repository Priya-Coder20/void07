'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { X, User, Mail, Briefcase, GraduationCap, Building } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    year?: string;
    designation?: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            fetchProfile();
        }
    }, [isOpen, user]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const res = await axios.get('http://localhost:5000/api/auth/me', config);
            setProfile(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <User size={40} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{profile?.name || 'User'}</h2>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize mt-2">
                        {profile?.role}
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading profile...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-gray-800 font-medium">{profile?.email}</p>
                            </div>
                        </div>

                        {profile?.role === 'student' && (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Building className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-xs text-gray-500">Department</p>
                                        <p className="text-gray-800 font-medium">{profile?.department}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <GraduationCap className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-xs text-gray-500">Year</p>
                                        <p className="text-gray-800 font-medium">{profile?.year}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {(profile?.role === 'staff' || profile?.role === 'admin') && profile?.designation && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Briefcase className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-xs text-gray-500">Designation</p>
                                    <p className="text-gray-800 font-medium">{profile?.designation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
