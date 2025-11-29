'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Lock, AlertTriangle, Maximize2 } from 'lucide-react';

interface Question {
    questionText: string;
    type: string;
    options?: string[];
    _id?: string;
}

interface Assignment {
    _id: string;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    totalPoints: number;
    questions: Question[];
}

export default function TakeAssignment() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submission, setSubmission] = useState<any>(null);

    // Lockdown state
    const [isLocked, setIsLocked] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const submissionInProgress = useRef(false);

    useEffect(() => {
        if (id && user?.token) {
            fetchData();
        }
    }, [id, user]);

    // Lockdown Effect
    useEffect(() => {
        if (!isLocked || submission) return;

        // Push state to trap back button
        window.history.pushState(null, '', window.location.href);

        const handleViolation = (reason: string) => {
            // Prevent multiple submissions
            if (submissionInProgress.current) return;

            submissionInProgress.current = true;

            // Remove listeners immediately
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('contextmenu', preventCopyPaste);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);

            alert(`VIOLATION DETECTED: ${reason}. Assignment is being auto-submitted.`);
            handleSubmit(true);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation('Tab switching or minimized window');
            }
        };

        const handleBlur = () => {
            handleViolation('Window lost focus (Alt+Tab or other application)');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleViolation('Exited fullscreen mode');
            }
        };

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            handleViolation('Attempted to navigate back');
        };

        const preventCopyPaste = (e: any) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F5' ||
                e.key === 'F11' ||
                e.key === 'F12' ||
                (e.ctrlKey && e.key === 'r') ||
                (e.altKey && e.key === 'ArrowLeft')
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('popstate', handlePopState);
        document.addEventListener('contextmenu', preventCopyPaste);
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('contextmenu', preventCopyPaste);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isLocked, submission]);

    const fetchData = async () => {
        try {
            const assignRes = await axios.get(`http://localhost:5000/api/assignments/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setAssignment(assignRes.data);

            const listRes = await axios.get('http://localhost:5000/api/assignments', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const myAssignment = listRes.data.find((a: any) => a._id === id);

            if (myAssignment && myAssignment.submissionStatus === 'completed') {
                const subRes = await axios.get(`http://localhost:5000/api/assignments/${id}/my-submission`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setSubmission(subRes.data);

                const filledAnswers: any = {};
                subRes.data.answers.forEach((ans: any, idx: number) => {
                    filledAnswers[idx] = ans.answer;
                });
                setAnswers(filledAnswers);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const enterLockdown = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsLocked(true);
        } catch (err) {
            console.error("Error attempting to enable fullscreen:", err);
            alert("Could not enter fullscreen mode. Please try again or check browser permissions.");
        }
    };

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers({ ...answers, [index]: value });
    };

    const handleSubmit = async (force = false) => {
        if (!assignment) return;
        if (!force && !confirm('Are you sure you want to submit? You cannot change answers after submission.')) return;

        setSubmitting(true);
        try {
            const formattedAnswers = assignment.questions.map((q, idx) => ({
                questionText: q.questionText,
                answer: answers[idx] || ''
            }));

            await axios.post('http://localhost:5000/api/assignments/submit', {
                assignmentId: assignment._id,
                answers: formattedAnswers
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            setIsLocked(false);

            if (force) {
                alert('Assignment auto-submitted due to suspicious activity.');
            } else {
                alert('Assignment submitted successfully!');
            }
            router.push('/student/assignments');
        } catch (error: any) {
            console.error('Error submitting assignment:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to submit assignment.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading assignment...</div>;
    if (!assignment) return <div className="p-8 text-center">Assignment not found</div>;

    // If submitted, show normal view (read-only)
    if (submission) {
        return (
            <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 font-medium">
                    <ArrowLeft size={20} /> Back to Assignments
                </button>
                {/* Reuse the card UI for read-only view */}
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="border-b border-gray-100 pb-8 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                <CheckCircle size={20} /> Assignment Submitted
                            </div>
                        </div>
                        {/* Questions List (Read-only) */}
                        <div className="space-y-8">
                            {assignment.questions.map((q, idx) => (
                                <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm flex-shrink-0">{idx + 1}</span>
                                        {q.questionText}
                                    </h3>
                                    <div className="pl-11 text-gray-700 font-medium">
                                        {answers[idx] || <span className="text-gray-400 italic">No answer provided</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If not locked, show start screen
    if (!isLocked) {
        return (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Lockdown</h2>
                        <p className="text-gray-500">
                            This assignment requires a secure environment.
                            Once you start, the browser will enter fullscreen mode.
                        </p>
                    </div>

                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm text-left space-y-2 border border-yellow-100">
                        <div className="font-bold flex items-center gap-2">
                            <AlertTriangle size={16} /> Rules:
                        </div>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                            <li>Fullscreen is mandatory.</li>
                            <li>No tab switching allowed.</li>
                            <li>Copy/Paste is disabled.</li>
                            <li><strong>Any violation will auto-submit your work immediately.</strong></li>
                        </ul>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={enterLockdown}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                        >
                            Start Assignment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Locked View (Fullscreen Content)
    return (
        <div ref={containerRef} className="fixed inset-0 bg-gray-50 overflow-y-auto z-[9999] p-8">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {assignment.subject}
                                </span>
                            </div>
                            <p className="text-gray-500 text-lg leading-relaxed">{assignment.description}</p>
                        </div>

                        <div className="flex gap-6 bg-gray-50 p-5 rounded-xl min-w-[200px]">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Time Remaining</div>
                                <div className="font-bold text-gray-900">--:--</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                <div className="font-bold text-red-600 flex items-center gap-1">
                                    <Lock size={14} /> Locked
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {assignment.questions.map((q, idx) => (
                            <div key={idx} className="group bg-gray-50 hover:bg-white p-6 rounded-2xl border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                                <h3 className="font-bold text-gray-900 mb-4 text-lg flex gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    {q.questionText}
                                </h3>

                                {q.type === 'multiple-choice' && q.options ? (
                                    <div className="space-y-3 pl-11">
                                        {q.options.map((opt, optIdx) => (
                                            <label key={optIdx} className={`flex items-center gap-4 p-4 bg-white border rounded-xl transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-sm ${answers[idx] === opt
                                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30'
                                                : 'border-gray-200'
                                                }`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${answers[idx] === opt ? 'border-blue-600' : 'border-gray-300'
                                                    }`}>
                                                    {answers[idx] === opt && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`question-${idx}`}
                                                    value={opt}
                                                    checked={answers[idx] === opt}
                                                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                    className="hidden"
                                                />
                                                <span className="font-medium text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="pl-11">
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-gray-900 leading-relaxed bg-white shadow-sm"
                                            rows={5}
                                            placeholder="Type your answer here..."
                                            value={answers[idx] || ''}
                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 -mx-8 -mb-8 rounded-b-2xl">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg hover:-translate-y-0.5"
                        >
                            {submitting ? 'Submitting...' : (
                                <>
                                    <Send size={20} />
                                    Submit Assignment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
