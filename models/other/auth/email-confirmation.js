import sequelize from '../../../modules/sequelize';
const Sequelize = require('sequelize');


const EmailConfirmationTemp = sequelize.define('EmailConfirmationTemp', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

export default EmailConfirmationTemp;
