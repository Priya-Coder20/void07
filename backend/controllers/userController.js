const { Student, Staff, Admin } = require('../models');

// @desc    Create a student
// @route   POST /api/users/student
// @access  Private/Admin
const createStudent = async (req, res) => {
    const { name, email, password, department, year } = req.body;

    try {
        const userExists = await Student.findOne({ where: { email } });
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
                _id: student.id,
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

// @desc    Create an admin
// @route   POST /api/users/admin
// @access  Private/Admin
const createAdmin = async (req, res) => {
    const { name, email, password, designation } = req.body;

    try {
        const userExists = await Admin.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password,
            role: 'admin',
            designation,
        });

        if (admin) {
            res.status(201).json({
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
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
        const userExists = await Staff.findOne({ where: { email } });
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
                _id: staff.id,
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

        const students = await Student.findAll({ attributes: { exclude: ['password'] } });
        const staff = await Staff.findAll({ attributes: { exclude: ['password'] } });
        let admins = await Admin.findAll({ attributes: { exclude: ['password'] } });

        // Exclude the requesting admin from the list
        if (req.user && req.user.role === 'admin') {
            admins = admins.filter(admin => admin.id !== req.user.id);
        }

        const formatUser = (u) => {
            const user = u.toJSON();
            return { ...user, _id: user.id };
        };

        res.json([
            ...admins.map(formatUser),
            ...staff.map(formatUser),
            ...students.map(formatUser)
        ]);
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

        let user = await Student.findByPk(req.params.id);
        if (!user) user = await Staff.findByPk(req.params.id);
        if (!user) user = await Admin.findByPk(req.params.id);

        if (user) {
            await user.destroy();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Check if email exists
// @route   POST /api/users/check-email
// @access  Private/Admin
const checkEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const student = await Student.findOne({ where: { email } });
        const staff = await Staff.findOne({ where: { email } });
        const admin = await Admin.findOne({ where: { email } });

        if (student || staff || admin) {
            return res.json({ available: false, message: 'Email already in use' });
        }
        res.json({ available: true, message: 'Email is available' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, department, year, designation } = req.body;

    try {
        let user = await Student.findByPk(id);
        let userType = 'student';

        if (!user) {
            user = await Staff.findByPk(id);
            userType = 'staff';
        }
        if (!user) {
            user = await Admin.findByPk(id);
            userType = 'admin';
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from modifying their own account
        if (userType === 'admin' && req.user.id === user.id) {
            return res.status(403).json({ message: 'Admins cannot modify their own account' });
        }

        // Update common fields
        user.name = name || user.name;
        user.email = email || user.email;

        // Update role-specific fields
        if (userType === 'student') {
            user.department = department || user.department;
            user.year = year || user.year;
        } else if (userType === 'staff') {
            user.designation = designation || user.designation;
        } else if (userType === 'admin') {
            user.designation = designation || user.designation;
        }

        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            designation: user.designation,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createStudent, createStaff, createAdmin, getUsers, deleteUser, checkEmail, updateUser };
