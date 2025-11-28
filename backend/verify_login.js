const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-connect');
        console.log('Connected');

        const user = await User.findOne({ email: 'admin@example.com' });
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }
        console.log('User found:', user.email);
        console.log('Hashed Password:', user.password);

        const isMatch = await user.matchPassword('password123');
        console.log('Password Match:', isMatch);

        if (isMatch) {
            console.log('LOGIN SUCCESS (Script)');
        } else {
            console.log('LOGIN FAILED (Script)');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
