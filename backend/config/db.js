const mysql = require('mysql2/promise');
const { sequelize } = require('../models');

const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
};

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database synced.');
  } catch (error) {
    throw error;
  }
};

module.exports = {
  connectDatabase,
  sequelize,
};
