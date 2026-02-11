require('dotenv').config();
const { User, sequelize } = require('../models');

const checkUser = async () => {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({
            attributes: ['id', 'email', 'role', 'isBanned']
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
checkUser();
