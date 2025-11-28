const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
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

app.get('/', (req, res) => {
    res.json({ message: 'Campus Connect API is running' });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    // Sync models
    try {
        await sequelize.sync({ alter: true });
        console.log('Database & Tables synced!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
