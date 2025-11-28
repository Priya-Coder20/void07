const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const { User, Admin, Staff, Student } = require('./models/User');
const { Resource } = require('./models/Booking');

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('seed_debug.log', msg + '\n');
};

const seedData = async () => {
    try {
        fs.writeFileSync('seed_debug.log', 'Starting seed...\n');
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-connect';
        log(`Attempting to connect to: ${uri}`);

        await mongoose.connect(uri);
        log('MongoDB Connected');

        log('Clearing existing data...');
        try {
            await User.deleteMany({});
            await Resource.deleteMany({});
            log('Data cleared');
        } catch (err) {
            log(`Error clearing data: ${err.message}`);
        }

        log('Creating Admin...');
        try {
            const admin = await Admin.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            });
            log(`Admin created: ${admin.email}`);
        } catch (err) {
            log(`Error creating admin: ${err.message}`);
            log(err.stack);
        }

        log('Creating Staff...');
        try {
            const staff = await Staff.create({
                name: 'Staff User',
                email: 'staff@example.com',
                password: 'password123',
                role: 'staff',
                designation: 'Professor',
            });
            log(`Staff created: ${staff.email}`);
        } catch (err) {
            log(`Error creating staff: ${err.message}`);
        }

        log('Creating Student...');
        try {
            const student = await Student.create({
                name: 'Student User',
                email: 'student@example.com',
                password: 'password123',
                role: 'student',
                department: 'Computer Science',
                year: '3rd Year',
            });
            log(`Student created: ${student.email}`);
        } catch (err) {
            log(`Error creating student: ${err.message}`);
        }

        log('Creating Resources...');
        try {
            await Resource.create([
                { name: 'Main Library', type: 'library' },
                { name: 'Physics Lab', type: 'lab' },
                { name: 'Discussion Room A', type: 'room' },
            ]);
            log('Resources created');
        } catch (err) {
            log(`Error creating resources: ${err.message}`);
        }

        log('Seed completed');
        process.exit(0);
    } catch (error) {
        log(`SEED FATAL ERROR: ${error.message}`);
        log(error.stack);
        process.exit(1);
    }
};

seedData();
