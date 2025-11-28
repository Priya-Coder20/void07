'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserPlus, Users, Calendar, BookOpen, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Create Student', href: '/admin/create-student', icon: UserPlus },
        { name: 'Create Staff', href: '/admin/create-staff', icon: UserPlus },
        { name: 'Manage Users', href: '/admin/manage-users', icon: Users },
        { name: 'Manage Bookings', href: '/admin/bookings', icon: CheckSquare },
        { name: 'Announcements', href: '/admin/announcements', icon: BookOpen },
    ];

    const staffLinks = [
        { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'Schedule', href: '/staff/schedule', icon: Calendar },
        { name: 'Upload Materials', href: '/staff/upload-materials', icon: BookOpen },
        { name: 'Manage Bookings', href: '/admin/bookings', icon: CheckSquare },
    ];

    const studentLinks = [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Schedule', href: '/student/schedule', icon: Calendar },
        { name: 'Study Materials', href: '/student/materials', icon: BookOpen },
        { name: 'Book Resource', href: '/student/book-resource', icon: BookOpen },
    ];

    let links: { name: string; href: string; icon: any }[] = [];
    if (user?.role === 'admin') links = adminLinks;
    else if (user?.role === 'staff') links = staffLinks;
    else if (user?.role === 'student') links = studentLinks;

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-800">
                Campus Connect
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 p-3 rounded transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 p-3 w-full rounded hover:bg-red-600 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
