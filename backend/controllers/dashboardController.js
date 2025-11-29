const { Student, Staff, Admin } = require('../models');
const Content = require('../models_mongo/Content');
const ManagedBy = require('../models_mongo/ManagedBy');
const BookedBy = require('../models_mongo/BookedBy');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await Student.count();
        const totalStaff = await Staff.count();

        res.json({
            totalStudents,
            totalStaff,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Staff Dashboard Stats
// @route   GET /api/dashboard/staff
// @access  Private (Staff)
const getStaffStats = async (req, res) => {
    try {
        // Count schedule items uploaded by this staff member
        const myClasses = await Content.countDocuments({
            type: 'schedule',
            uploadedBy: req.user.id
        });

        // Count pending bookings (From MongoDB BookedBy)
        // Ideally, we should only count bookings for resources managed by THIS staff.
        // But for now, let's count all pending bookings or just those matching managed resources.
        // Let's find managed resources first.
        const managedBy = await ManagedBy.findOne({ staffEmail: req.user.email });
        let pendingRequests = 0;

        if (managedBy && managedBy.resources.length > 0) {
            const resourceIds = managedBy.resources.map(r => r.resourceId);
            pendingRequests = await BookedBy.countDocuments({
                resourceId: { $in: resourceIds },
                status: 'pending'
            });
        }

        const materialsUploaded = managedBy ? managedBy.resources.length : 0;

        res.json({
            myClasses,
            pendingRequests,
            materialsUploaded,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentStats = async (req, res) => {
    try {
        // Count all schedule items (Classes)
        const upcomingClasses = await Content.countDocuments({ type: 'schedule' });

        // Count all material items (Assignments/Notes)
        const newAssignments = await Content.countDocuments({ type: 'material' });

        // Count all announcement items (Events)
        const eventsThisWeek = await Content.countDocuments({ type: 'announcement' });

        res.json({
            upcomingClasses,
            newAssignments,
            eventsThisWeek,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAdminStats,
    getStaffStats,
    getStudentStats,
};
