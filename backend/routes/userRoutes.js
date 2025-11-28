const express = require('express');
const router = express.Router();
const { createStudent, createStaff, getUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/student').post(protect, authorize('admin'), createStudent);
router.route('/staff').post(protect, authorize('admin'), createStaff);
router.route('/:id').delete(protect, authorize('admin'), deleteUser);

module.exports = router;
