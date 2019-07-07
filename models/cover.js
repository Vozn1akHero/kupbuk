import sequelize from '../modules/sequelize';
const Sequelize = require('sequelize')

import Offer from "./offer";

const Cover = sequelize.define('Cover', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Cover.hasMany(Offer, {
    foreignKey: 'coverId',
    sourceKey: 'id'
});

export default Cover;
