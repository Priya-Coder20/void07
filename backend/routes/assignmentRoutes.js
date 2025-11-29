const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these exist
const {
    createAssignment,
    getAssignments,
    getAssignmentById,
    submitAssignment,
    getSubmissions,
    gradeSubmission,
    deleteAssignment,
    getMySubmission
} = require('../controllers/assignmentController');

// Public/Shared routes (Protected)
router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignmentById);

// Student routes
router.post('/submit', protect, authorize('student'), submitAssignment);
router.get('/:assignmentId/my-submission', protect, authorize('student'), getMySubmission);

// Staff/Admin routes
router.post('/', protect, authorize('staff', 'admin'), createAssignment);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteAssignment);
router.get('/:assignmentId/submissions', protect, authorize('staff', 'admin'), getSubmissions);
router.put('/submissions/:submissionId/grade', protect, authorize('staff', 'admin'), gradeSubmission);

module.exports = router;
