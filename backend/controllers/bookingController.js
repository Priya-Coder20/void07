const { Resource, Booking, User } = require('../models');

// @desc    Get all resources
// @route   GET /api/bookings/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    const { resourceId, date, startTime, endTime } = req.body;

    try {
        const booking = await Booking.create({
            resourceId,
            userId: req.user.id,
            date,
            startTime,
            endTime,
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all bookings (for Admin/Staff) or My Bookings (Student)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'student') {
            bookings = await Booking.findAll({
                where: { userId: req.user.id },
                include: [
                    { model: Resource },
                    { model: User, attributes: ['name'] },
                ],
            });
        } else {
            bookings = await Booking.findAll({
                include: [
                    { model: Resource },
                    { model: User, attributes: ['name'] },
                ],
            });
        }
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const booking = await Booking.findByPk(req.params.id);

        if (booking) {
            booking.status = status;
            await booking.save();
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a resource (Admin only - helper)
// @route   POST /api/bookings/resources
// @access  Private (Admin)
const createResource = async (req, res) => {
    const { name, type } = req.body;
    try {
        const resource = await Resource.create({ name, type });
        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getResources, createBooking, getBookings, updateBookingStatus, createResource };
