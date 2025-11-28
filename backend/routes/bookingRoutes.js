const express = require('express');
const router = express.Router();
const { getResources, createBooking, getBookings, updateBookingStatus, createResource } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/resources')
    .get(protect, getResources)
    .post(protect, authorize('admin', 'staff'), createResource);

router.route('/')
    .post(protect, authorize('student'), createBooking)
    .get(protect, getBookings);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateBookingStatus);

module.exports = router;
