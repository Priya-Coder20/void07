'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Search, BookOpen, Home, Monitor, Box, Calendar } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import BookingModal from '@/components/BookingModal';

interface Resource {
    _id: string;
    name: string;
    type: string;
    status: string;
}

interface Booking {
    _id: string;
    resourceId: string;
    Resource: {
        name: string;
        type: string;
    };
    requestDate: string;
    duration: number;
    period: string;
    quantity: number;
    status: string;
}

export default function BookResource() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('library');
    const [resources, setResources] = useState<Resource[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'library', label: 'Library/Books', icon: BookOpen },
        { id: 'room', label: 'Hostel/Rooms', icon: Home },
        { id: 'lab', label: 'Lab Equipments', icon: Monitor },
        { id: 'other', label: 'Others', icon: Box },
        { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
    ];

    useEffect(() => {
        fetchResources();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'my-bookings') {
            fetchBookings();
        }
    }, [activeTab, user]);

    const fetchResources = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.get('http://localhost:5000/api/bookings/resources', config);
            setResources(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.get('http://localhost:5000/api/bookings', config);
            setBookings(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBook = (resource: Resource) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
        setMessage('');
    };

    const handleConfirmBooking = async (bookingData: { duration?: number; quantity?: number }) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.post('http://localhost:5000/api/bookings', {
                resourceId: selectedResource?._id,
                resourceType: selectedResource?.type,
                ...bookingData
            }, config);
            setMessage('Booking request sent successfully!');
            setIsModalOpen(false);
            if (activeTab === 'my-bookings') fetchBookings();
        } catch (error) {
            console.error(error);
            setMessage('Error sending booking request');
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesTab = activeTab === 'other'
            ? !['library', 'room', 'lab'].includes(res.type)
            : res.type === activeTab;
        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Resource Booking</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${isActive
                                ? tab.id === 'my-bookings'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {activeTab === 'my-bookings' ? (
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 min-h-[400px]">
                    <h2 className="text-xl font-bold text-purple-900 mb-4">My Bookings</h2>
                    {bookings.length === 0 ? (
                        <p className="text-gray-500">No bookings found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="bg-white p-4 rounded shadow-sm border border-purple-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800">{booking.Resource?.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded capitalize ${booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="flex items-center gap-2"><Calendar size={14} /> Requested: {new Date(booking.requestDate).toLocaleDateString()}</p>
                                        <p className="flex items-center gap-2"><Box size={14} /> {booking.Resource?.type}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Duration: {booking.duration} {booking.period} {booking.quantity > 1 ? `(Qty: ${booking.quantity})` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading resources...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.length > 0 ? (
                                filteredResources.map((resource) => (
                                    <ResourceCard
                                        key={resource._id}
                                        resource={resource}
                                        onBook={handleBook}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                                    No resources found in this category.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                resource={selectedResource}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
}
