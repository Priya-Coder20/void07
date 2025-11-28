'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
}

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
    const { user } = useAuth();
    const [userType, setUserType] = useState<'admin' | 'staff' | 'student'>('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        year: '',
        designation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const [emailStatus, setEmailStatus] = useState<'idle' | 'valid-format' | 'invalid-format' | 'checking' | 'available' | 'taken'>('idle');
    const [emailMessage, setEmailMessage] = useState('');

    const [passwordRules, setPasswordRules] = useState({
        minLength: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }

        if (e.target.name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(e.target.value)) {
                setEmailStatus('valid-format');
                setEmailMessage('');
            } else {
                setEmailStatus('invalid-format');
                setEmailMessage('');
            }
        }

        if (e.target.name === 'password') {
            const val = e.target.value;
            setPasswordRules({
                minLength: val.length >= 8,
                hasLower: /[a-z]/.test(val),
                hasUpper: /[A-Z]/.test(val),
                hasNumber: /\d/.test(val),
                hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(val),
            });
        }
    };

    const handleEmailBlur = async () => {
        if (emailStatus === 'valid-format') {
            setEmailStatus('checking');
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                const res = await axios.post('http://localhost:5000/api/users/check-email', { email: formData.email }, config);
                if (res.data.available) {
                    setEmailStatus('available');
                    setEmailMessage('');
                } else {
                    setEmailStatus('taken');
                    setEmailMessage('Email already in use');
                }
            } catch (error) {
                console.error(error);
                setEmailStatus('valid-format'); // Revert if error
            }
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        } else if (emailStatus === 'taken') {
            newErrors.email = 'Email already in use';
        }

        const allRulesMet = Object.values(passwordRules).every(Boolean);

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!allRulesMet) {
            newErrors.password = 'Password does not meet complexity requirements';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (userType === 'student') {
            if (!formData.department.trim()) newErrors.department = 'Department is required';
            if (!formData.year.trim()) newErrors.year = 'Year is required';
        }

        if (userType === 'staff') {
            if (!formData.designation) newErrors.designation = 'Designation is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            let endpoint = '';
            if (userType === 'student') endpoint = 'http://localhost:5000/api/users/student';
            else if (userType === 'staff') endpoint = 'http://localhost:5000/api/users/staff';
            else if (userType === 'admin') endpoint = 'http://localhost:5000/api/users/admin';

            // Exclude confirmPassword from payload
            const { confirmPassword, ...payload } = formData;

            await axios.post(endpoint, payload, config);

            onUserAdded();
            onClose();
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                department: '',
                year: '',
                designation: '',
            });
            setErrors({});
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Error creating user');
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if all password rules are met
    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    const isFormValid =
        formData.name.trim() !== '' &&
        emailStatus === 'available' &&
        isPasswordValid &&
        formData.password === formData.confirmPassword &&
        (userType === 'student' ? (formData.department.trim() !== '' && formData.year.trim() !== '') : true) &&
        (userType === 'staff' ? formData.designation !== '' : true);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New User</h2>

                {apiError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                    <div className="flex gap-2">
                        {(['student', 'staff', 'admin'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setUserType(type);
                                    setErrors({});
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${userType === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleEmailBlur}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black pr-10 ${emailStatus === 'available' ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                    emailStatus === 'taken' || emailStatus === 'invalid-format' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                            />
                            {emailStatus === 'available' && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                            )}
                            {(emailStatus === 'taken' || emailStatus === 'invalid-format') && (
                                <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                            )}
                        </div>
                        {emailMessage && <p className="text-red-500 text-xs mt-1">{emailMessage}</p>}
                        {errors.email && !emailMessage && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black pr-10 ${formData.password && isPasswordValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                        formData.password && !isPasswordValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                            errors.password ? 'border-red-500' : ''
                                    }`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {formData.password && isPasswordValid && <Check className="text-green-500" size={20} />}
                                {formData.password && !isPasswordValid && <AlertCircle className="text-red-500" size={20} />}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {/* Password Rules List */}
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className={`flex items-center gap-1 ${passwordRules.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                                {passwordRules.minLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                At least 8 characters
                            </div>
                            <div className={`flex items-center gap-1 ${passwordRules.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                                {passwordRules.hasLower ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                At least one lowercase
                            </div>
                            <div className={`flex items-center gap-1 ${passwordRules.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                                {passwordRules.hasUpper ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                At least one uppercase
                            </div>
                            <div className={`flex items-center gap-1 ${passwordRules.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                {passwordRules.hasNumber ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                At least one number
                            </div>
                            <div className={`flex items-center gap-1 ${passwordRules.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                                {passwordRules.hasSpecial ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                At least one special char
                            </div>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black pr-10 ${formData.confirmPassword && formData.confirmPassword === formData.password ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                        formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                            errors.confirmPassword ? 'border-red-500' : ''
                                    }`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {formData.confirmPassword && formData.confirmPassword === formData.password && <Check className="text-green-500" size={20} />}
                                {formData.confirmPassword && formData.confirmPassword !== formData.password && <AlertCircle className="text-red-500" size={20} />}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {userType === 'student' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.department ? 'border-red-500' : ''}`}
                                />
                                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${errors.year ? 'border-red-500' : ''}`}
                                />
                                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                            </div>
                        </div>
                    )}

                    {userType === 'staff' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <select
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.designation ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Designation</option>
                                <option value="Director">Director</option>
                                <option value="Assistant director">Assistant director</option>
                                <option value="Dean">Dean</option>
                                <option value="HoD">HoD</option>
                                <option value="Professor">Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Assistant">Assistant</option>
                            </select>
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : `Create ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
