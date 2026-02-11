require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

const createSuperAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'superadmin@example.com';
        const password = 'SuperSecretPassword123!';
        const name = 'Super Admin';

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log('Super Admin already exists.');

            if (existing.role !== 'super_admin') {
                existing.role = 'super_admin';
                await existing.save();
                console.log('Updated existing user to Super Admin role.');
            }

            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'super_admin',
            isBanned: false,
        });

        console.log('Super Admin created successfully.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating Super Admin:', error);
    } finally {
        await sequelize.close();
    }
};

createSuperAdmin();
