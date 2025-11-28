import { Calendar, Clock, MapPin, Box } from 'lucide-react';

interface Resource {
    _id: string;
    name: string;
    type: string;
    status: string;
}

interface ResourceCardProps {
    resource: Resource;
    onBook: (resource: Resource) => void;
}

const ResourceCard = ({ resource, onBook }: ResourceCardProps) => {
    const getIcon = () => {
        switch (resource.type) {
            case 'library': return <Box className="text-blue-500" />;
            case 'lab': return <MapPin className="text-green-500" />;
            case 'room': return <Calendar className="text-purple-500" />;
            default: return <Box className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${resource.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {resource.status}
                </span>
            </div>

            <button
                onClick={() => onBook(resource)}
                disabled={resource.status !== 'available'}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Clock size={16} />
                Book Now
            </button>
        </div>
    );
};

export default ResourceCard;
