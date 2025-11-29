const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const connectMongo = require('./config/mongo');
require('./models'); // Import models to setup associations

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Campus Connect API is running' });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

const BookedBy = require('./models_mongo/BookedBy');

const startServer = async () => {
    await connectDB();
    await connectMongo();

    // Sync models
    try {
        await sequelize.sync({ alter: true });
        console.log('Database & Tables synced!');

        // Clear BookedBy collection on server start (as requested)
        await BookedBy.deleteMany({});
        console.log('Cleared BookedBy collection (Server Start).');

        // Delete requests older than 1 month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        await BookedBy.deleteMany({ requestDate: { $lt: oneMonthAgo }, status: 'pending' });
        console.log('Cleaned up old pending requests.');

    } catch (error) {
        console.error('Error syncing database or cleaning up:', error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
