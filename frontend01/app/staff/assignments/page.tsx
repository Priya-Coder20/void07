'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Plus, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
    _id: string;
    title: string;
    subject: string;
    dueDate: string;
    totalPoints: number;
    description: string;
}

export default function StaffAssignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        dueDate: '',
        totalPoints: 100,
        questions: [{ questionText: '', type: 'short-answer' }]
    });

    useEffect(() => {
        if (user?.token) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setAssignments(res.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/assignments/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setAssignments(assignments.filter(a => a._id !== id));
        } catch (error) {
            console.error('Error deleting assignment:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/assignments', formData, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setShowCreateModal(false);
            fetchAssignments();
            // Reset form
            setFormData({
                title: '',
                subject: '',
                description: '',
                dueDate: '',
                totalPoints: 100,
                questions: [{ questionText: '', type: 'short-answer' }]
            });
        } catch (error) {
            console.error('Error creating assignment:', error);
        }
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { questionText: '', type: 'short-answer' }]
        });
    };

    const updateQuestion = (index: number, field: string, value: string) => {
        const newQuestions: any = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    if (loading) return <div className="p-8 text-center">Loading assignments...</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500 mt-1">Manage and track student assignments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                >
                    <Plus size={20} />
                    Create Assignment
                </button>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                    <div key={assignment._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {assignment.subject}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/staff/assignments/${assignment._id}`}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <Eye size={18} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(assignment._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Assignment"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{assignment.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{assignment.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                <BookOpen size={16} className="text-gray-400" />
                                <span className="font-semibold text-gray-700">{assignment.totalPoints} pts</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-gray-900">Create New Assignment</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Trash2 size={24} className="rotate-45" /> {/* Using Trash2 as close icon temporarily */}
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                                        placeholder="e.g. Midterm Project"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                                        placeholder="e.g. Mathematics"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    required
                                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-gray-900"
                                    rows={3}
                                    placeholder="Describe the assignment details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Points</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                                        value={formData.totalPoints}
                                        onChange={e => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">Questions</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        + Add Question
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.questions.map((q, idx) => (
                                        <div key={idx} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                                            <span className="mt-3 text-sm font-bold text-gray-400 w-6">Q{idx + 1}</span>
                                            <input
                                                type="text"
                                                placeholder="Enter question text..."
                                                className="flex-1 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                value={q.questionText}
                                                onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                                                required
                                            />
                                            <select
                                                className="border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white text-gray-900"
                                                value={q.type}
                                                onChange={e => updateQuestion(idx, 'type', e.target.value)}
                                            >
                                                <option value="short-answer">Text</option>
                                                <option value="multiple-choice">Multiple Choice</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                                >
                                    Create Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
