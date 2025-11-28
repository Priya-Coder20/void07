'use client';

import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 ml-64">
            <h2 className="text-xl font-semibold text-gray-800">
                Welcome, {user?.name || 'User'}
            </h2>
            <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {user?.role}
                </span>
            </div>
        </header>
    );
};

export default Navbar;
