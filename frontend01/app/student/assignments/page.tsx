'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { BookOpen, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
    _id: string;
    title: string;
    subject: string;
    dueDate: string;
    totalPoints: number;
    description: string;
    submissionStatus?: 'due' | 'completed'; // Added for filtering
}

export default function StudentAssignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Loading assignments...</div>;

    const dueAssignments = assignments.filter((a: Assignment) => a.submissionStatus !== 'completed');
    const completedAssignments = assignments.filter((a: Assignment) => a.submissionStatus === 'completed');

    const AssignmentCard = ({ assignment, isCompleted }: { assignment: Assignment, isCompleted: boolean }) => (
        <div key={assignment._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {assignment.subject}
                </div>
                <div className="text-sm font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {assignment.totalPoints} pts
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{assignment.title}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">{assignment.description}</p>

            <div className="border-t border-gray-100 pt-5 mt-auto space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar size={16} className={isCompleted ? "text-green-500" : "text-blue-500"} />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>

                <Link
                    href={`/student/assignments/${assignment._id}`}
                    className={`block w-full text-center py-3 rounded-xl transition-all duration-200 font-bold shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30'
                        }`}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle size={18} />
                            View Submission
                        </>
                    ) : (
                        <>
                            Take Assignment
                            <ArrowRight size={18} />
                        </>
                    )}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-gray-500 mt-1">Track your progress and upcoming deadlines</p>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                    Due Assignments
                </h2>
                {dueAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dueAssignments.map(a => <AssignmentCard key={a._id} assignment={a} isCompleted={false} />)}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-400 mb-3">
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No due assignments. You're all caught up!</p>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                    Completed Assignments
                </h2>
                {completedAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedAssignments.map(a => <AssignmentCard key={a._id} assignment={a} isCompleted={true} />)}
                    </div>
                ) : (
                    <p className="text-gray-500 italic pl-2">No completed assignments yet.</p>
                )}
            </div>
        </div>
    );
}
