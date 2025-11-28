const { connectDB, sequelize } = require('./config/db');
const { User, Resource, Booking, Content } = require('./models');

const seedData = async () => {
    try {
        await connectDB();

        // Sync and clear data
        await sequelize.sync({ force: true }); // This drops and recreates tables
        console.log('Database synced and cleared');

        console.log('Creating Admin...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });
        console.log('Admin created:', admin.email);

        console.log('Creating Staff...');
        const staff = await User.create({
            name: 'Staff User',
            email: 'staff@example.com',
            password: 'password123',
            role: 'staff',
            designation: 'Professor',
        });
        console.log('Staff created:', staff.email);

        console.log('Creating Student...');
        const student = await User.create({
            name: 'Student User',
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
            department: 'Computer Science',
            year: '3rd Year',
        });
        console.log('Student created:', student.email);

        console.log('Creating Resources...');
        await Resource.bulkCreate([
            { name: 'Main Library', type: 'library' },
            { name: 'Physics Lab', type: 'lab' },
            { name: 'Discussion Room A', type: 'room' },
        ]);
        console.log('Resources created');

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('SEED ERROR:', error);
        process.exit(1);
    }
};

seedData();
