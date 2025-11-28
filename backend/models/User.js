const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'student'],
        required: true,
    },
}, { discriminatorKey: 'role', timestamps: true });

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Admin Discriminator
const Admin = User.discriminator('admin', new mongoose.Schema({}));

// Staff Discriminator
const Staff = User.discriminator('staff', new mongoose.Schema({
    designation: {
        type: String,
        required: true,
    },
}));

// Student Discriminator
const Student = User.discriminator('student', new mongoose.Schema({
    department: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
}));

module.exports = { User, Admin, Staff, Student };
