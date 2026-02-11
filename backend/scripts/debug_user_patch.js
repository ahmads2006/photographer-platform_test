require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');
const axios = require('axios');

const run = async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: 'hrobahmad@gmail.com' } });
        if (user) {
            user.password = await bcrypt.hash('password123', 10);
            await user.save();
            console.log('Password reset for hrobahmad@gmail.com');
        } else {
            console.log('User hrobahmad@gmail.com not found');
            return;
        }

        const API_URL = 'http://localhost:5000/api';

        console.log('Logging in as hrobahmad...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'hrobahmad@gmail.com',
            password: 'password123'
        });
        const token = res.data.token;
        console.log('Logged in. Token:', token.substring(0, 20) + '...');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Testing PATCH /auth/me...');
        await axios.patch(`${API_URL}/auth/me`, { name: 'Updated Name', avatar: 'http://example.com/avatar.jpg' }, config);
        console.log('PATCH /auth/me OK');

    } catch (e) {
        console.error('Error:', e.response?.status, e.response?.data || e.message);
    } finally {
        await sequelize.close();
    }
};

run();
