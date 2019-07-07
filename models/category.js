import sequelize from '../modules/sequelize';
const Sequelize = require('sequelize')

import Offer from "./offer";

const Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hrefIdentifier: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Category.hasMany(Offer, {
    foreignKey: 'categoryId',
    sourceKey: 'id'
});

export default Category;
