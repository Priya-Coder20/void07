'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Search, BookOpen, Home, Monitor, Box, Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import BookingModal from '@/components/BookingModal';
import AddResourceModal from '@/components/AddResourceModal';

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
    User: {
        name: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export default function StaffBookings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('managed');
    const [managedSubTab, setManagedSubTab] = useState<'booked' | 'available'>('booked');
    const [resources, setResources] = useState<Resource[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'managed', label: 'Managed Resources', icon: CheckCircle },
        { id: 'library', label: 'Library/Books', icon: BookOpen },
        { id: 'room', label: 'Hostel/Rooms', icon: Home },
        { id: 'lab', label: 'Lab Equipments', icon: Monitor },
        { id: 'other', label: 'Others', icon: Box },
    ];

    useEffect(() => {
        fetchResources();
        fetchBookings();
    }, [user]);

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

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status }, config);
            fetchBookings(); // Refresh list
            setMessage(`Booking ${status} successfully`);
        } catch (error) {
            console.error(error);
            setMessage('Error updating booking status');
        }
    };

    const handleBook = (resource: Resource) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
        setMessage('');
    };

    const handleConfirmBooking = async (bookingData: { date: string; startTime: string; endTime: string }) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.post('http://localhost:5000/api/bookings', {
                resourceId: selectedResource?._id,
                ...bookingData
            }, config);
            setMessage('Booking request sent successfully!');
            setIsModalOpen(false);
            fetchBookings();
        } catch (error) {
            console.error(error);
            setMessage('Error sending booking request');
        }
    };

    const handleAddResource = async (resourceData: { name: string; type: string }) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.post('http://localhost:5000/api/bookings/resources', resourceData, config);
            setMessage('Resource added successfully!');
            setIsAddResourceModalOpen(false);
            fetchResources();
        } catch (error) {
            console.error(error);
            setMessage('Error adding resource');
        }
    };

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved');

    // Filter resources for the "Available" sub-tab (showing all resources for now, could filter by status)
    const availableResourcesList = resources;

    const filteredResources = resources.filter(res => {
        if (activeTab === 'managed') return false; // Handled separately
        const matchesTab = activeTab === 'other'
            ? !['library', 'room', 'lab'].includes(res.type)
            : res.type === activeTab;
        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Bookings</h1>

            {/* Main Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {activeTab === 'managed' ? (
                <div className="space-y-8">
                    {/* Top Section: Requests */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="text-orange-500" />
                            Pending Requests
                        </h2>
                        {pendingBookings.length === 0 ? (
                            <p className="text-gray-500 italic">No pending requests.</p>
                        ) : (
                            <div className="grid gap-4">
                                {pendingBookings.map((booking) => (
                                    <div key={booking._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{booking.Resource?.name}</h3>
                                            <p className="text-sm text-gray-600">Requested by: <span className="font-medium">{booking.User?.name}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {booking.date} | {booking.startTime} - {booking.endTime}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(booking._id, 'approved')}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Managed Resources */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">My Resources</h2>
                            <button
                                onClick={() => setIsAddResourceModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} />
                                Add Resource
                            </button>
                        </div>

                        {/* Sub Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-gray-100">
                            <button
                                onClick={() => setManagedSubTab('booked')}
                                className={`pb-2 px-1 font-medium transition-colors ${managedSubTab === 'booked'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Booked (by Student)
                            </button>
                            <button
                                onClick={() => setManagedSubTab('available')}
                                className={`pb-2 px-1 font-medium transition-colors ${managedSubTab === 'available'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Available Resources
                            </button>
                        </div>

                        {managedSubTab === 'booked' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {approvedBookings.length === 0 ? (
                                    <p className="text-gray-500 italic col-span-full">No active bookings.</p>
                                ) : (
                                    approvedBookings.map((booking) => (
                                        <div key={booking._id} className="bg-blue-50 p-4 rounded border border-blue-100">
                                            <h3 className="font-bold text-gray-800">{booking.Resource?.name}</h3>
                                            <p className="text-sm text-gray-600">Booked by: {booking.User?.name}</p>
                                            <div className="mt-2 text-xs text-blue-800 flex items-center gap-2">
                                                <Calendar size={12} /> {booking.date}
                                                <Clock size={12} /> {booking.startTime} - {booking.endTime}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableResourcesList.map((resource) => (
                                    <div key={resource._id} className="p-4 border rounded hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${resource.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {resource.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Search Bar for other tabs */}
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

            <AddResourceModal
                isOpen={isAddResourceModalOpen}
                onClose={() => setIsAddResourceModalOpen(false)}
                onResourceAdded={handleAddResource}
            />
        </div>
    );
}
