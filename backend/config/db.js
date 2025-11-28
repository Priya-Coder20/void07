const { Sequelize } = require('sequelize');
const { Client } = require('pg');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'campus_connect';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const createDbIfNotExists = async () => {
    const client = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: 'postgres', // Connect to default database
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Database ${DB_NAME} not found. Creating...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database ${DB_NAME} created successfully.`);
        } else {
            console.log(`Database ${DB_NAME} already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: false,
    port: DB_PORT,
});

const connectDB = async () => {
    await createDbIfNotExists();
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
