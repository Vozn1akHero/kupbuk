import sequelize from '../modules/sequilize';


import * as Sequelize from 'sequelize';

import { format } from 'date-fns';

import cacheObj from "../modules/redisCache";

const Offer = sequelize.define('Offer', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sellerId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(1000),
        allowNull: false
    },
    amountOfPages: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    language: {
        type: Sequelize.STRING,
        allowNull: false
    },
    publishNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    publishDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    coverId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    thumbnailUrl: {
        type: Sequelize.STRING(1000),
        allowNull: false
    },
    sold: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});


const cacheObjForModel = cacheObj
    .model('Offer')
    .ttl(15);

Offer.addNewOffer = async (newOffer) => {
    const offer = {
        sellerId: newOffer.sellerId,
        title: newOffer.title,
        author: newOffer.author,
        description: newOffer.description,
        amountOfPages: newOffer.amountOfPages,
        language: newOffer.language,
        publishNumber: newOffer.publishNumber,
        city: newOffer.city,
        publishDate: format(new Date(), 'YYYY-MM-DD HH:MM'),
        price: newOffer.price.split(".")[1].length > 0 ? newOffer.price : Number(newOffer.price + ".00"),
        categoryId: newOffer.categoryId,
        coverId: newOffer.coverId,
        thumbnailUrl: `/uploads/${newOffer.filename}`,
        sold: 0
    };

    await Offer.create(offer);
};

Offer.getOffer = (id) => {
    return cacheObjForModel.query(`select o.*,
     c.title as categoryTitle,
     co.title as coverTitle,
     u.firstName as sellerFirstName,
     u.userAvatar as sellerAvatar,
      u.lastName as sellerLastName,
      u.email as sellerEmail,
      o.sold as purchaseStatus
       from Offers o JOIN Categories c ON o.categoryId = c.id JOIN Covers co ON o.coverId = co.id JOIN Users u ON o.sellerId = u.id WHERE o.id = ${id}`)
        .then(res => typeof(res) != 'undefined' && res[0] ? res[0] : null)
        .catch(() => null);
};

Offer.getOffers = async (category, rangeStart, rangeEnd) => {
    if(category === "all"){
        return Offer.findAll({
            where: {
                id: {
                    [Sequelize.Op.between] : [rangeStart, rangeEnd]
                },
                sold: 0
            },
            raw: true
        }).catch(e => {
            console.log(e);
            return null;
        });
    }
    else{
        const categoryId = await sequelize.query(`SELECT id FROM Categories WHERE hrefIdentifier = :hrefIdentifier`, {
            replacements: { hrefIdentifier: category },
            type: Sequelize.QueryTypes.SELECT
        }).then(res => res[0].id);

        return Offer.findAll({
            where: {
                id: {
                    [Sequelize.Op.between] : [rangeStart, rangeEnd]
                },
                categoryId: categoryId,
                sold: 0
            },
            raw: true
        }).catch(e => {
            console.log(e);
            return null;
        });
    }
};

Offer.findOffers = (searchPhrase) => {
    return Offer.findAll({
        where: {
            [Sequelize.Op.or]: [
                {
                    title: {
                        [Sequelize.Op.like]: `${searchPhrase}%`
                    }
                },
                {
                    description: {
                        [Sequelize.Op.like]: `${searchPhrase}%`
                    }
                },
                {
                    author: {
                        [Sequelize.Op.like]: `${searchPhrase}%`
                    }
                }
            ]
        },
        raw: true
    })
};

Offer.getCount = (category) => {
    if(category === "all") return sequelize.query(`select COUNT(*) as result from Offers`, {
        type: Sequelize.QueryTypes.SELECT
    }).then(res => res[0].result);

    else return sequelize.query(`select COUNT(*) as result from Offers o JOIN Categories c ON o.categoryId = c.id WHERE c.hrefIdentifier = :hrefIdentifier`,{
        replacements: { hrefIdentifier: category },
        type: Sequelize.QueryTypes.SELECT
    }).then(res => res[0].result);
};

Offer.removeOffer = (id) => {
    Offer.update({ sold: 1 }, { where: { id: id }});
};

export default Offer;
