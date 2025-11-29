const { sequelize } = require('../config/db');
const Student = require('./Student');
const Staff = require('./Staff');
const Admin = require('./Admin');


// Associations





module.exports = {
    sequelize,
    Student,
    Staff,
    Admin,

};
