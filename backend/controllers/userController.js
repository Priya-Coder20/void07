const { User, Admin, Staff, Student } = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a student
// @route   POST /api/users/student
// @access  Private/Admin
const createStudent = async (req, res) => {
    const { name, email, password, department, year } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const student = await Student.create({
            name,
            email,
            password,
            department,
            year,
            role: 'student',
        });

        if (student) {
            res.status(201).json({
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a staff member
// @route   POST /api/users/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
    const { name, email, password, designation } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const staff = await Staff.create({
            name,
            email,
            password,
            designation,
            role: 'staff',
        });

        if (staff) {
            res.status(201).json({
                _id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createStudent, createStaff, getUsers, deleteUser };
