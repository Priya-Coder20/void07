const { connectDB } = require('./config/db');
const connectMongo = require('./config/mongo');
const { Student, Staff, Admin } = require('./models');
const Book = require('./models_mongo/Book');
const Hostel = require('./models_mongo/Hostel');
const LabEquipment = require('./models_mongo/LabEquipment');
const ManagedBy = require('./models_mongo/ManagedBy');
const BookedBy = require('./models_mongo/BookedBy');
const Request = require('./models_mongo/Request');

const seedResources = async () => {
    try {
        await connectDB();
        await connectMongo();

        console.log('Clearing MongoDB collections...');
        await Book.deleteMany({});
        await Hostel.deleteMany({});
        await LabEquipment.deleteMany({});
        await ManagedBy.deleteMany({});
        await BookedBy.deleteMany({});
        await Request.deleteMany({});

        console.log('Seeding Books...');
        const books = await Book.insertMany([
            { title: 'Introduction to Algorithms', author: 'Cormen', isbn: '9780262033848', quantityAvailable: 5 },
            { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', quantityAvailable: 3 },
            { title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', quantityAvailable: 2 },
        ]);

        console.log('Seeding Hostels...');
        const hostels = await Hostel.insertMany([
            { blockNumber: 'A', roomNumber: '101', type: 'single', costPerPeriod: 5000, period: 'month' },
            { blockNumber: 'A', roomNumber: '102', type: 'double', costPerPeriod: 3000, period: 'month' },
            { blockNumber: 'B', roomNumber: '201', type: 'single', costPerPeriod: 5000, period: 'month' },
        ]);

        console.log('Seeding Lab Equipment...');
        const equipment = await LabEquipment.insertMany([
            { name: 'Microscope', totalQuantity: 10, quantityBooked: 0 },
            { name: 'Oscilloscope', totalQuantity: 5, quantityBooked: 0 },
            { name: 'Bunsen Burner', totalQuantity: 20, quantityBooked: 0 },
        ]);

        console.log('Seeding ManagedBy...');
        const staff = await Staff.findOne({ email: 'staff@example.com' });
        if (staff) {
            await ManagedBy.create({
                staffEmail: staff.email,
                resources: [
                    { resourceId: books[0]._id, resourceType: 'Book' },
                    { resourceId: hostels[0]._id, resourceType: 'Hostel' },
                    { resourceId: equipment[0]._id, resourceType: 'LabEquipment' },
                ]
            });
        }

        console.log('Seeding Requests...');
        const student = await Student.findOne({ email: 'student@example.com' });
        if (student) {
            await Request.create({
                userEmail: student.email,
                resourceId: books[1]._id,
                resourceType: 'Book',
                duration: 7,
                period: 'days',
                status: 'pending'
            });
            await Request.create({
                userEmail: student.email,
                resourceId: hostels[1]._id,
                resourceType: 'Hostel',
                duration: 6,
                period: 'months',
                status: 'pending'
            });
        }

        console.log('Seeding BookedBy (Active Bookings)...');
        if (student) {
            await BookedBy.create({
                userEmail: student.email,
                resourceId: books[0]._id,
                resourceType: 'Book',
                duration: 14,
                period: 'days',
                status: 'approved',
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            });
        }

        console.log('Resource Seeding Completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding resources:', error);
        process.exit(1);
    }
};

seedResources();
