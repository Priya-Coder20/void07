'use client';

import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 ml-64">
            <h2 className="text-xl font-semibold text-gray-800">
                Welcome, {user?.name}
            </h2>
            <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {user?.role}
                </span>
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="View Profile"
                >
                    <User size={20} />
                </button>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    );
};

export default Navbar;
