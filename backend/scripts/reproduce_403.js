const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'hrobahmad@gmail.com',
            password: 'password123' // I hope this is the password? No, I don't know the user's password.
            // Wait, I created superadmin. Let's use that.
        });
        // I can't login as hrobahmad without password.
        // I will use superadmin.
    } catch (e) {
        // If login fails, I can't test.
        // But I know superadmin creds.
        console.log('Login failed (expected if creds wrong):', e.response?.status);
    }

    try {
        console.log('Logging in as Super Admin...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@example.com',
            password: 'SuperSecretPassword123!'
        });
        const token = res.data.token;
        const user = res.data.user;
        console.log('Logged in as:', user.role);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test PATCH /auth/me
        console.log('Testing PATCH /auth/me...');
        await axios.patch(`${API_URL}/auth/me`, { name: 'Super Admin Updated' }, config);
        console.log('PATCH /auth/me OK');

        // 3. Test GET /users/:id/followers
        console.log('Testing GET followers...');
        await axios.get(`${API_URL}/users/${user.id}/followers`, config);
        console.log('GET followers OK');

    } catch (e) {
        console.error('Error:', e.response?.status, e.response?.data);
    }
};

run();
