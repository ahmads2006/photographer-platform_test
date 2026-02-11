require('dotenv').config();
const { User, sequelize } = require('../models');

const checkUser = async () => {
    try {
        await sequelize.authenticate();
        // The user's email in previous scripts was hrobahmad@gmail.com.
        // Let's check that user.
        const user = await User.findOne({ where: { email: 'hrobahmad@gmail.com' } });
        if (user) {
            console.log(`User found: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`ID: ${user.id}`);
        } else {
            console.log('User not found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

checkUser();
