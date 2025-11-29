const { Student, Staff, Admin } = require('../models');
const Book = require('../models_mongo/Book');
const Hostel = require('../models_mongo/Hostel');
const LabEquipment = require('../models_mongo/LabEquipment');
const ManagedBy = require('../models_mongo/ManagedBy');
const BookedBy = require('../models_mongo/BookedBy');
const Request = require('../models_mongo/Request');

// @desc    Get all resources
// @route   GET /api/bookings/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        const books = await Book.find();
        const hostels = await Hostel.find();
        const labEquipments = await LabEquipment.find();

        const formattedBooks = books.map(b => ({
            _id: b._id,
            name: b.title,
            type: 'library',
            status: b.quantityAvailable > 0 ? 'available' : 'unavailable',
            details: b
        }));

        const formattedHostels = hostels.map(h => ({
            _id: h._id,
            name: `${h.blockNumber}-${h.roomNumber}`,
            type: 'room',
            status: h.isAvailable ? 'available' : 'unavailable',
            details: h
        }));

        const formattedLabEquipments = labEquipments.map(l => ({
            _id: l._id,
            name: l.name,
            type: 'lab',
            status: l.totalQuantity > l.quantityBooked ? 'available' : 'unavailable',
            details: l
        }));

        const resources = [...formattedBooks, ...formattedHostels, ...formattedLabEquipments];
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    const { resourceId, resourceType, duration, quantity } = req.body;

    try {
        // Validation based on Resource Type
        if (resourceType === 'library') { // Book
            const book = await Book.findById(resourceId);
            if (!book) return res.status(404).json({ message: 'Book not found' });
            if (book.quantityAvailable < 1) return res.status(400).json({ message: 'Book not available' });
            if (duration > 20) return res.status(400).json({ message: 'Max duration for books is 20 days' });
        } else if (resourceType === 'room') { // Hostel
            const hostel = await Hostel.findById(resourceId);
            if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
            if (!hostel.isAvailable) return res.status(400).json({ message: 'Hostel room not available' });
        } else if (resourceType === 'lab') { // Lab Equipment
            const equipment = await LabEquipment.findById(resourceId);
            if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
            if (quantity > (equipment.totalQuantity - equipment.quantityBooked)) {
                return res.status(400).json({ message: 'Not enough quantity available' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid resource type' });
        }

        // Create Booking Request in MongoDB
        const request = await Request.create({
            userEmail: req.user.email,
            resourceId,
            resourceType: resourceType === 'library' ? 'Book' : resourceType === 'room' ? 'Hostel' : 'LabEquipment',
            duration,
            period: resourceType === 'room' ? 'months' : 'days',
            quantity: resourceType === 'lab' ? quantity : 1,
            status: 'pending'
        });

        res.status(201).json(request);
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
            // Fetch all requests (pending, approved, rejected) for the student
            const rawRequests = await Request.find({ userEmail: req.user.email }).sort({ createdAt: -1 });

            // Populate Resource details
            const bookings = await Promise.all(rawRequests.map(async (req) => {
                const reqObj = req.toObject();

                let resource;
                if (req.resourceType === 'Book') resource = await Book.findById(req.resourceId);
                else if (req.resourceType === 'Hostel') resource = await Hostel.findById(req.resourceId);
                else if (req.resourceType === 'LabEquipment') resource = await LabEquipment.findById(req.resourceId);

                reqObj.Resource = resource ? {
                    name: resource.title || resource.name || `${resource.blockNumber}-${resource.roomNumber}`,
                    type: req.resourceType
                } : { name: 'Unknown Resource', type: 'unknown' };

                return reqObj;
            }));

            res.json(bookings);
        } else if (req.user.role === 'staff') {
            // Fetch resources managed by this staff
            const managedBy = await ManagedBy.findOne({ staffEmail: req.user.email });
            if (managedBy && managedBy.resources.length > 0) {
                const resourceIds = managedBy.resources.map(r => r.resourceId);

                // Fetch pending requests for these resources
                const rawRequests = await Request.find({
                    resourceId: { $in: resourceIds },
                    status: 'pending'
                });

                // Manually populate details for requests
                const pendingRequests = await Promise.all(rawRequests.map(async (req) => {
                    const reqObj = req.toObject();

                    // Fetch User (Student)
                    const student = await Student.findOne({ where: { email: req.userEmail }, attributes: ['name'] });
                    reqObj.User = student ? { name: student.name } : { name: req.userEmail };

                    // Fetch Resource
                    let resource;
                    if (req.resourceType === 'Book') resource = await Book.findById(req.resourceId);
                    else if (req.resourceType === 'Hostel') resource = await Hostel.findById(req.resourceId);
                    else if (req.resourceType === 'LabEquipment') resource = await LabEquipment.findById(req.resourceId);

                    reqObj.Resource = resource ? {
                        name: resource.title || resource.name || `${resource.blockNumber}-${resource.roomNumber}`,
                        type: req.resourceType
                    } : { name: 'Unknown Resource', type: 'unknown' };

                    return reqObj;
                }));

                // Fetch active bookings for these resources
                const activeBookings = await BookedBy.find({
                    resourceId: { $in: resourceIds }
                });

                const populatedActiveBookings = await Promise.all(activeBookings.map(async (b) => {
                    const bObj = b.toObject();
                    const student = await Student.findOne({ where: { email: b.userEmail }, attributes: ['name'] });
                    bObj.User = student ? { name: student.name } : { name: b.userEmail };

                    let resource;
                    if (b.resourceType === 'Book') resource = await Book.findById(b.resourceId);
                    else if (b.resourceType === 'Hostel') resource = await Hostel.findById(b.resourceId);
                    else if (b.resourceType === 'LabEquipment') resource = await LabEquipment.findById(b.resourceId);

                    bObj.Resource = resource ? {
                        name: resource.title || resource.name || `${resource.blockNumber}-${resource.roomNumber}`,
                        type: b.resourceType
                    } : { name: 'Unknown Resource', type: 'unknown' };

                    return bObj;
                }));

                return res.json({ pendingRequests, activeBookings: populatedActiveBookings });
            } else {
                return res.json({ pendingRequests: [], activeBookings: [] });
            }
        } else {
            bookings = await BookedBy.find();
            res.json(bookings);
        }
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
        const request = await Request.findById(req.params.id);

        if (request) {
            request.status = status;
            await request.save();

            if (status === 'approved') {
                // Create confirmed booking
                await BookedBy.create({
                    userEmail: request.userEmail,
                    resourceId: request.resourceId,
                    resourceType: request.resourceType,
                    duration: request.duration,
                    period: request.period,
                    quantity: request.quantity,
                    status: 'approved',
                    startDate: new Date(),
                    // Calculate endDate based on duration and period
                    endDate: new Date(new Date().setDate(new Date().getDate() + (request.period === 'months' ? request.duration * 30 : request.duration))),
                });
            }

            res.json(request);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a resource (Staff only)
// @route   POST /api/bookings/resources
// @access  Private (Staff)
const createResource = async (req, res) => {
    const { name, type, ...otherProps } = req.body;
    try {
        let resource;
        if (type === 'library') {
            resource = await Book.create({
                title: name,
                author: otherProps.author || 'Unknown',
                isbn: otherProps.isbn || `TEMP-${Date.now()}`,
                quantityAvailable: 1
            });
        } else if (type === 'room') {
            resource = await Hostel.create({
                blockNumber: name.split('-')[0] || 'A',
                roomNumber: name.split('-')[1] || name,
                type: 'single',
                costPerPeriod: 0,
                period: 'month'
            });
        } else if (type === 'lab') {
            resource = await LabEquipment.create({
                name: name,
                totalQuantity: 1
            });
        } else {
            // Default or 'other'
            // For now, maybe treat as LabEquipment or throw error?
            // Let's treat as LabEquipment for simplicity or just return error
            return res.status(400).json({ message: 'Invalid resource type' });
        }

        // Add to ManagedBy
        await ManagedBy.findOneAndUpdate(
            { staffEmail: req.user.email },
            { $push: { resources: { resourceId: resource._id, resourceType: type === 'library' ? 'Book' : type === 'room' ? 'Hostel' : 'LabEquipment' } } },
            { upsert: true, new: true }
        );

        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getResources, createBooking, getBookings, updateBookingStatus, createResource };
