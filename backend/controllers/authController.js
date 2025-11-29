const jwt = require('jsonwebtoken');
const { Student, Staff, Admin } = require('../models');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await Admin.findOne({ where: { email } });
        let role = 'admin';

        if (!user) {
            user = await Staff.findOne({ where: { email } });
            role = 'staff';
        }

        if (!user) {
            user = await Student.findOne({ where: { email } });
            role = 'student';
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginUser };
