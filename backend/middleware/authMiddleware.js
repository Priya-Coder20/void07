const jwt = require('jsonwebtoken');
const { Student, Staff, Admin } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { id, role } = decoded;
            let user;

            if (role === 'admin') {
                user = await Admin.findByPk(id, { attributes: { exclude: ['password'] } });
            } else if (role === 'staff') {
                user = await Staff.findByPk(id, { attributes: { exclude: ['password'] } });
            } else if (role === 'student') {
                user = await Student.findByPk(id, { attributes: { exclude: ['password'] } });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
