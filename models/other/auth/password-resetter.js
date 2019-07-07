import sequelize from '../../../modules/sequelize';
const Sequelize = require('sequelize');


const PasswordResetterTemp = sequelize.define('PasswordResetterTemp', {
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


export default PasswordResetterTemp;
