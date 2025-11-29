'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Search, Plus, Filter, Pencil } from 'lucide-react';
import AddUserModal from '@/components/AddUserModal';
import EditUserModal from '@/components/EditUserModal';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    year?: string;
    designation?: string;
}

export default function ManageUsers() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const res = await axios.get('http://localhost:5000/api/users', config);
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let result = users;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name.toLowerCase().includes(lowerTerm) ||
                    u.email.toLowerCase().includes(lowerTerm)
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter((u) => u.role === roleFilter);
        }

        setFilteredUsers(result);
    };

    const deleteUser = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                await axios.delete(`http://localhost:5000/api/users/${id}`, config);
                setMessage('User deleted successfully');
                setUsers(users.filter((u) => u._id !== id));
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400" size={20} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                u.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {u.role === 'student' && `${u.department} - ${u.year}`}
                                            {u.role === 'staff' && u.designation}
                                            {u.role === 'admin' && '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setUserToEdit(u);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors mr-2"
                                                title="Edit User"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserAdded={() => {
                    fetchUsers();
                    setMessage('User added successfully');
                    setTimeout(() => setMessage(''), 3000);
                }}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userToEdit={userToEdit}
                onUserUpdated={() => {
                    fetchUsers();
                    setMessage('User updated successfully');
                    setTimeout(() => setMessage(''), 3000);
                }}
            />
        </div>
    );
}
