require('dotenv').config();
const axios = require('axios');

const run = async () => {
    try {
        const API_URL = 'http://localhost:5000/api';

        console.log('Logging in as hrobahmad...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'hrobahmad@gmail.com',
            password: 'password123'
        });
        const token = res.data.token;
        console.log('Logged in.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Testing GET /messages...');
        const msgRes = await axios.get(`${API_URL}/messages`, config);
        console.log('GET /messages OK. Count:', msgRes.data.messages?.length);

    } catch (e) {
        console.error('Error:', e.response?.status, e.response?.data || e.message);
    }
};

run();
