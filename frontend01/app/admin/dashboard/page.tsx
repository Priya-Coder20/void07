export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Staff</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">56</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 text-left">
                        <span className="font-semibold block">Create New Announcement</span>
                        <span className="text-sm opacity-75">Post updates for students and staff</span>
                    </button>
                    <button className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 text-left">
                        <span className="font-semibold block">Review Booking Requests</span>
                        <span className="text-sm opacity-75">Approve or reject resource bookings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
