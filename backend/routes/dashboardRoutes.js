const express = require('express');
const router = express.Router();
const { getAdminStats, getStaffStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/staff', protect, authorize('staff'), getStaffStats);
router.get('/student', protect, authorize('student'), getStudentStats);

module.exports = router;
