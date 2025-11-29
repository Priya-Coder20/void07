import { useState } from 'react';
import { X } from 'lucide-react';

interface Resource {
    _id: string;
    name: string;
    type: string;
    status: string;
    details?: any;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource | null;
    onConfirm: (bookingData: { duration?: number; quantity?: number }) => void;
}

const BookingModal = ({ isOpen, onClose, resource, onConfirm }: BookingModalProps) => {
    const [duration, setDuration] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    if (!isOpen || !resource) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (resource.type === 'library' && duration > 20) {
            setError('Max duration for books is 20 days');
            return;
        }
        if (resource.type === 'lab' && resource.details && quantity > (resource.details.totalQuantity - resource.details.quantityBooked)) {
            setError('Not enough quantity available');
            return;
        }

        onConfirm({ duration, quantity });
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

                <h2 className="text-xl font-bold mb-2 text-gray-800">Book {resource.name}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {resource.type === 'library' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Max 20 days. Fine: ₹{resource.details?.finePerDay || 0}/day</p>
                        </div>
                    )}

                    {resource.type === 'room' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Cost: ₹{resource.details?.costPerPeriod || 0}/{resource.details?.period || 'month'}</p>
                        </div>
                    )}

                    {resource.type === 'lab' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={resource.details ? resource.details.totalQuantity - resource.details.quantityBooked : 1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Fine: ₹{resource.details?.finePerDay || 0}/day</p>
                            </div>
                        </>
                    )}

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
