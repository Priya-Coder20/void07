const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Content = sequelize.define('Content', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM('schedule', 'material', 'announcement'),
        allowNull: false,
    },
    fileUrl: {
        type: DataTypes.STRING,
    },
    targetAudience: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['student'],
    },
}, {
    timestamps: true,
});

module.exports = Content;
