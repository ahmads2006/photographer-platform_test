require('dotenv').config();
const { User, sequelize } = require('../models');

const promoteUser = async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: 'hrobahmad@gmail.com' } });
        if (user) {
            user.role = 'super_admin';
            await user.save();
            console.log(`User ${user.name} promoted to super_admin.`);
        } else {
            console.log('User not found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

promoteUser();
