const { sequelize } = require('../config/db');
const User = require('./User');
const { Resource, Booking } = require('./Booking');
const Content = require('./Content');

// Associations

// Booking Associations
Booking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Booking, { foreignKey: 'userId' });

Booking.belongsTo(Resource, { foreignKey: 'resourceId' });
Resource.hasMany(Booking, { foreignKey: 'resourceId' });

// Content Associations
Content.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });
User.hasMany(Content, { foreignKey: 'uploadedBy' });

module.exports = {
    sequelize,
    User,
    Resource,
    Booking,
    Content,
};
