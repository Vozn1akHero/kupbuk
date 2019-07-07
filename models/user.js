import sequelize from '../modules/sequelize';

const Sequelize = require('sequelize');

import Offer from "./offer";

import cacheObj from "../modules/redisCache";
import PasswordResetterTemp from "./other/auth/password-resetter";
import EmailConfirmationTemp from "./other/auth/email-confirmation";

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userAvatar: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "img/user.png"
    },
    birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    }
});

const cacheObjForModel = cacheObj
    .model('User')
    .ttl(15);

User.hasMany(Offer, {
    foreignKey: 'sellerId',
    sourceKey: 'id'
});

User.hasMany(PasswordResetterTemp, {
    foreignKey: 'userId',
    sourceKey: 'id'
});

User.hasMany(EmailConfirmationTemp, {
    foreignKey: 'userId',
    sourceKey: 'id'
});

User.getUser = async (userData) => {
    return {
      userData,
      offers: await cacheObjForModel
          .query(`SELECT Offers.id, title, author, price, Offers.city FROM Offers JOIN Users ON Offers.sellerId = Users.id WHERE Users.id =  ${userData.id}`)
          .then(res => res)
    };
};

User.updateAvatar = (userId, newAvatar) => {
    User.update(
        {
            userAvatar: newAvatar
        },
        {
            where: {
                id: userId
            }
    })
};

export default User;
