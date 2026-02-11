require('dotenv').config();
const { sequelize } = require('../models');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Force sync to apply changes
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

        // Build explicit queries for enum update if sync fails (common issue)
        try {
            await sequelize.query("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'user') DEFAULT 'user';");
            console.log('Role enum updated.');
        } catch (e) {
            console.log('Role enum update skipped or failed (might already be correct):', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
