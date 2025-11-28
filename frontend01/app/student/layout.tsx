'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'student')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user || user.role !== 'student') return null;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar />
            <Navbar />
            <main className="ml-64 p-8">{children}</main>
        </div>
    );
}
