import sequelize from '../modules/sequelize';
const Sequelize = require('sequelize');

import Offer from "./offer";

const BookState = sequelize.define('BookState', {
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

BookState.hasMany(Offer, {
    foreignKey: 'bookStateId',
    sourceKey: 'id'
});

export default BookState;
