const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resource = sequelize.define('Resource', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    _id: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.id;
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('library', 'lab', 'room'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('available', 'maintenance'),
        defaultValue: 'available',
    },
});

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    _id: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.id;
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
});

module.exports = { Resource, Booking };
