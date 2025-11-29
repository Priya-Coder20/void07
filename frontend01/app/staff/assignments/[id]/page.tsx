'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Award, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Submission {
    _id: string;
    studentName: string;
    submittedAt: string;
    score: number;
    status: string;
    answers: { questionText: string; answer: string }[];
}

interface Assignment {
    _id: string;
    title: string;
    description: string;
    subject: string;
    totalPoints: number;
    dueDate: string;
}

export default function AssignmentDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeScore, setGradeScore] = useState<number>(0);

    useEffect(() => {
        if (id && user?.token) {
            fetchData();
        }
    }, [id, user]);

    const fetchData = async () => {
        try {
            const [assignRes, subRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/assignments/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }),
                axios.get(`http://localhost:5000/api/assignments/${id}/submissions`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                })
            ]);
            setAssignment(assignRes.data);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setSelectedSubmission(null);
        }
    };

    const handleGrade = async () => {
        if (!selectedSubmission) return;
        try {
            await axios.put(`http://localhost:5000/api/assignments/submissions/${selectedSubmission._id}/grade`,
                { score: gradeScore },
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );

            // Update local state
            setSubmissions(submissions.map(s =>
                s._id === selectedSubmission._id ? { ...s, score: gradeScore, status: 'graded' } : s
            ));
            setSelectedSubmission(null);
        } catch (error) {
            console.error('Error grading submission:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!assignment) return <div className="p-8 text-center">Assignment not found</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 font-medium">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {assignment.subject}
                            </span>
                        </div>
                        <p className="text-gray-500 text-lg leading-relaxed">{assignment.description}</p>
                    </div>
                    <div className="flex gap-8 bg-gray-50 p-6 rounded-xl min-w-[200px]">
                        <div>
                            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Due Date</div>
                            <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" />
                                {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Points</div>
                            <div className="font-bold text-blue-600 text-lg flex items-center gap-2">
                                <Award size={18} />
                                {assignment.totalPoints}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Student Submissions <span className="text-gray-400 font-normal ml-2">({submissions.length})</span></h2>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Student Name</th>
                                <th className="py-4 px-6 font-semibold">Submitted At</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Score</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="py-4 px-6 font-medium text-gray-900">{sub.studentName}</td>
                                    <td className="py-4 px-6 text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sub.status === 'graded'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-gray-900">
                                        {sub.status === 'graded' ? (
                                            <span className="text-green-600">{sub.score} <span className="text-gray-400 text-sm font-normal">/ {assignment.totalPoints}</span></span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(sub);
                                                setGradeScore(sub.score || 0);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline decoration-2 underline-offset-2"
                                        >
                                            View & Grade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 italic">No submissions received yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Grading Submission</h2>
                                <p className="text-gray-500 text-sm mt-1">Student: <span className="font-semibold text-gray-900">{selectedSubmission.studentName}</span></p>
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                            <div className="space-y-6">
                                {selectedSubmission.answers.map((ans, idx) => (
                                    <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Question {idx + 1}</div>
                                        <div className="font-medium text-gray-900 mb-3">{ans.questionText}</div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-800 leading-relaxed">
                                            {ans.answer || <span className="text-gray-400 italic">No answer provided</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Score (out of {assignment.totalPoints})</label>
                                    <input
                                        type="number"
                                        max={assignment.totalPoints}
                                        min={0}
                                        className="w-full border border-gray-200 rounded-xl p-3 text-lg font-semibold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                                        value={gradeScore}
                                        onChange={e => setGradeScore(parseInt(e.target.value))}
                                    />
                                </div>
                                <button
                                    onClick={handleGrade}
                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 font-bold text-lg mt-6"
                                >
                                    Submit Grade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
