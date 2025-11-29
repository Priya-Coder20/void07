const { Student, Staff, Admin } = require('../models');
const Content = require('../models_mongo/Content');
const ManagedBy = require('../models_mongo/ManagedBy');
const BookedBy = require('../models_mongo/BookedBy');
const Assignment = require('../models_mongo/Assignment');
const Submission = require('../models_mongo/Submission');

// Helper to get start and end of current week
const getStartAndEndOfWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

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

        // Count pending bookings for resources managed by this staff
        const managedBy = await ManagedBy.findOne({ staffEmail: req.user.email });
        let pendingRequests = 0;

        if (managedBy && managedBy.resources.length > 0) {
            const resourceIds = managedBy.resources.map(r => r.resourceId);
            pendingRequests = await BookedBy.countDocuments({
                resourceId: { $in: resourceIds },
                status: 'pending'
            });
        }

        // Count materials uploaded by this staff member
        const materialsUploaded = await Content.countDocuments({
            type: 'material',
            uploadedBy: req.user.id
        });

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
        // Count upcoming classes (Schedule items with future date)
        const upcomingClasses = await Content.countDocuments({
            type: 'schedule',
            scheduledDate: { $gte: new Date() }
        });

        // Count new assignments (Due in future and not submitted)
        const activeAssignments = await Assignment.find({
            dueDate: { $gte: new Date() }
        });

        const mySubmissions = await Submission.find({
            studentId: req.user.id
        });

        const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId.toString()));

        const newAssignments = activeAssignments.filter(a =>
            !submittedAssignmentIds.has(a._id.toString())
        ).length;

        // Count events/announcements for this week
        const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();
        const eventsThisWeek = await Content.countDocuments({
            type: 'announcement',
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        });

        res.json({
            upcomingClasses,
            newAssignments,
            eventsThisWeek,
            rewardPoints: req.user.rewards || 0,
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
