import bcrypt from 'bcrypt';

import sequelize from "../modules/sequilize";
import * as Sequelize from 'sequelize';

import { format } from 'date-fns';

import User from '../models/user';

exports.logIn = async (req, res, next) => {
    const userEmailOrLoginCorrectness = await sequelize
        .query('EXEC CheckIfLoginOrEmailExists :data',
            {replacements: { data: req.body.userLoginOrEmail} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!userEmailOrLoginCorrectness) return res.redirect('/login?inc_pass=true');

    const user = await User.findAll({
        where: {
            [Sequelize.Op.or]: [{login: req.body.userLoginOrEmail},
                {email: req.body.userLoginOrEmail}]
        }
    }).then(res => res[0].dataValues);

    bcrypt.compare(req.body.userPassword, user.password, (err, result) => {
        if(result) {
            req.session.isLoggedIn = true;
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                login: user.login,
                userAvatar: user.userAvatar
            };

            res.redirect('/shop');
        }

        else return res.redirect('/login?inc_pass=true');
    });
};

exports.joinUp = async (req, res, next) => {
    const emailAvailability = await sequelize
        .query('EXEC CheckIfEmailExists :data',
            {replacements: { data: req.body.RegInputEmail} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    const loginAvailability = await sequelize
        .query('EXEC CheckIfLoginExists :data',
            {replacements: { data: req.body.RegInputLogin} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!emailAvailability) return res.status(403).msg('EMAIL IS ALREADY TAKEN');
    else if(!loginAvailability)  return res.status(403).msg('LOGIN IS ALREADY TAKEN');

    bcrypt.hash(req.body.RegInputPassword, 10, async (err, hash) => {
        if(err) return res.status(403);

        const newUser = {
            firstName: req.body.RegInputName,
            lastName: req.body.RegInputSurname,
            login: req.body.RegInputLogin,
            email: req.body.RegInputEmail,
            password: hash,
            city: req.body.RegInputCity,
            birthdate: format(new Date(req.body.RegInputYear,  req.body.RegInputMonth-1, req.body.RegInputDay), 'YYYY-MM-DD')
        };

        sequelize.transaction().then(function(t) {
            User.create(newUser, {
                transaction: t
            }).then(function() {
                t.commit();
                //write some code to redirect newly created user to the login page
            }).catch(function(error) {
                console.log(error);
                t.rollback();
            });
        });
    });
};

exports.changePassword = async (req, res, next) => {
    const userActualPassword =  await sequelize
        .query('SELECT password FROM Users WHERE id = :userId',
            {replacements: { userId: req.session.user.id} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    bcrypt.compare(req.body.oldPassword, userActualPassword, (err, result) => {
        if(!result) {
            return res.status(403).render(`<div>INCORRECT PREVIOUS PASSWORD</div>`);
        }

        bcrypt.hash(req.body.newPassword, 10, async (err, hash) => {
            sequelize.transaction().then(function(t) {
                User.update({
                    password: hash
                }, {
                    where: {
                        id: req.session.user.id
                    },
                    transaction: t
                }).then(function() {
                    t.commit();
                    return res.status(200).render(`<div>PASSWORD WAS CORRECTLY CHANGED</div>`);
                }).catch(function(error) {
                    console.log(error);
                    t.rollback();
                });
            });
        });
    });
};

exports.changeEmail = (req, res, next) => {
    sequelize.transaction().then(function(t) {
        User.update({
            email: req.body.newEmail
        }, {
            where: {
                id: req.session.user.id
            },
            transaction: t
        }).then(function() {
            t.commit();
            return res.status(200).render(`<div>EMAIL WAS CORRECTLY CHANGED</div>`);
        }).catch(function(error) {
            console.log(error);
            t.rollback();
        });
    });
};

exports.logOut = (req, res, next) => {
    req.session.isLoggedIn = false;
    req.session.user = {};

    res.redirect('/login');
};
