import { useState } from 'react';
import { X } from 'lucide-react';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResourceAdded: (resourceData: { name: string; type: string }) => void;
}

const AddResourceModal = ({ isOpen, onClose, onResourceAdded }: AddResourceModalProps) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('library');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onResourceAdded({ name, type });
        setName('');
        setType('library');
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

                <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Resource</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                            placeholder="e.g., Projector 1, Room 101"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        >
                            <option value="library">Library/Books</option>
                            <option value="room">Hostel/Rooms</option>
                            <option value="lab">Lab Equipment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 mt-4"
                    >
                        Add Resource
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddResourceModal;
