import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface Resource {
    _id: string;
    name: string;
    type: string;
    status: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource | null;
    onConfirm: (bookingData: { date: string; startTime: string; endTime: string }) => void;
}

const BookingModal = ({ isOpen, onClose, resource, onConfirm }: BookingModalProps) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    if (!isOpen || !resource) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ date, startTime, endTime });
        // Reset form
        setDate('');
        setStartTime('');
        setEndTime('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-2 text-gray-800">Book Resource</h2>
                <p className="text-gray-600 mb-6">Booking: <span className="font-semibold text-blue-600">{resource.name}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 mt-4"
                    >
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
