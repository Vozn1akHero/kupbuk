require('dotenv').config();

import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`, {
    host: `${process.env.DB_HOST}`,
    dialect: 'mssql',
    dialectOptions: {
        options: { encrypt: true }
    }
});

export default sequelize
