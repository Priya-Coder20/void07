const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Admin, Staff, Student } = require('./models/User');
const { Resource } = require('./models/Booking');

dotenv.config();

const seedData = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-connect';
        console.log('Attempting to connect to:', uri);

        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        console.log('Clearing existing data...');
        try {
            await User.deleteMany({});
            await Resource.deleteMany({});
            console.log('Data cleared');
        } catch (err) {
            console.log('Error clearing data (might be empty DB):', err.message);
        }

        console.log('Creating Admin...');
        console.log('Admin model:', Admin);
        if (Admin && Admin.create) {
            console.log('Admin.create is a function');
        } else {
            console.log('Admin.create is NOT a function', Admin);
        }

        const admin = await Admin.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });
        console.log('Admin created:', admin.email);

        console.log('Creating Staff...');
        const staff = await Staff.create({
            name: 'Staff User',
            email: 'staff@example.com',
            password: 'password123',
            role: 'staff',
            designation: 'Professor',
        });
        console.log('Staff created:', staff.email);

        console.log('Creating Student...');
        const student = await Student.create({
            name: 'Student User',
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
            department: 'Computer Science',
            year: '3rd Year',
        });
        console.log('Student created:', student.email);

        console.log('Creating Resources...');
        await Resource.create([
            { name: 'Main Library', type: 'library' },
            { name: 'Physics Lab', type: 'lab' },
            { name: 'Discussion Room A', type: 'room' },
        ]);
        console.log('Resources created');

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('SEED ERROR:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

seedData();
