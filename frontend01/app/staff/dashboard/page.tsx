export default function StaffDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">My Classes</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Materials Uploaded</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 text-left">
                        <span className="font-semibold block">Upload Study Material</span>
                        <span className="text-sm opacity-75">Share notes and resources with students</span>
                    </button>
                    <button className="p-4 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100 text-left">
                        <span className="font-semibold block">Update Schedule</span>
                        <span className="text-sm opacity-75">Manage class timings and events</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
