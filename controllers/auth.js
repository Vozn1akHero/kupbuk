//external packages/functions
import bcrypt from 'bcrypt';
import { format } from 'date-fns';
import crypto from 'crypto';


//sequelize
import sequelize from "../modules/sequelize";
import * as Sequelize from 'sequelize';


//sql models
import User from '../models/user';
import PasswordResetterTemp from '../models/other/auth/password-resetter';
import EmailConfirmationTemp from '../models/other/auth/email-confirmation';
import EmailAlteringConfirmationTemp from "../models/other/auth/email-altering-confirmation";


//internal functions
import onPasswordRecoveryRequestMail from '../services/mail/password-recovery-request';
import newPasswordSender from '../services/mail/new-password-sender';
import emailConfirmationLinkSender from '../services/mail/email-confirmation-link-sender';



exports.logIn = async (req, res, next) => {
    const userEmailOrLoginCorrectness = await sequelize
        .query('EXEC CheckIfLoginOrEmailExists :data',
            {replacements: { data: req.body.userLoginOrEmail} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!userEmailOrLoginCorrectness) res.redirect('/login?inc_pass=true');

    const user = await User.findOne({
        where: {
            [Sequelize.Op.or]: [{login: req.body.userLoginOrEmail},
                {email: req.body.userLoginOrEmail}]
        },
        raw: true
    });

    if(!user) res.redirect('/login?inc_pass=true');

    //checking if user's email has already been confirmed
    const userEmailConfirmationStatus = await sequelize
        .query('EXEC CheckIfEmailIsConfirmed :data',
            {replacements: { data: user.id} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!userEmailConfirmationStatus) res.redirect('/login?email_wasnt_confirmed=true');

    bcrypt.compare(req.body.userPassword, user.password, (err, result) => {
        if(result) {
            req.session.isLoggedIn = true;
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                login: user.login,
                userAvatar: user.userAvatar,
                email: user.email
            };

            res.redirect('/shop');
        }

        else res.redirect('/login?inc_pass=true');
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
            }).then(user => {
                sequelize.transaction().then(tEmCn => {
                    const tokenForEmailConfirmation = crypto.randomBytes(20).toString('hex');

                    t.commit();

                    EmailConfirmationTemp.create({
                        token: tokenForEmailConfirmation,
                        userId: user.dataValues.id
                    }, {
                        transaction: tEmCn
                    }).then(eCT => {
                        emailConfirmationLinkSender(newUser.email, eCT.token).then(() => {
                            res.redirect('/login?reg_suc=true');
                        });

                        tEmCn.commit();
                    }).catch(error => {
                        console.log(error);

                        t.rollback();
                        tEmCn.rollback();
                    });
                });

            }).catch(error => {
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
            sequelize.transaction().then(t => {
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
                }).catch(error => {
                    console.log(error);
                    t.rollback();
                });
            });
        });
    });
};

exports.changeEmail = async (req, res, next) => {
    if(req.query.token) return res.status(403).msg('TOKEN WAS NOT SENT');

    const token = req.query.token;

    const tokenExistence = await sequelize
        .query('EXEC CheckIfTokenForEmailAlteringConfirmationExists :data',
            {replacements: { data: token} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!tokenExistence) return res.status(403).msg('TOKEN WAS NOT FOUND');

    const newEmailData = await EmailAlteringConfirmationTemp.findOne({
        where: {
            token: token
        },
        attributes: ['newEmail', 'userId'],
        raw: true
    }).then(res => res);

    sequelize.transaction().then(t => {
        User.update({
            email: newEmailData.newEmail
        }, {
            where: {
                id: newEmailData.userId
            },
            transaction: t
        }).then(function() {
            t.commit();
            return res.status(200).render(`<div>EMAIL WAS CORRECTLY CHANGED</div>`);
        }).catch(error => {
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

exports.passwordRecoveryRequest = async (req, res, next) => {
    const insertedEmail = req.body.userEmail;

    const emailExistence = await sequelize
        .query('EXEC CheckIfEmailExists :data',
            {replacements: { data: insertedEmail} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!emailExistence) return res.status(403).msg('EMAIL WAS NOT FOUND');

    const user = await User.findAll({
        where: {
            email: insertedEmail
        },
        attributes: ['id']
    }).then(res => res[0].dataValues);

    const token = crypto.randomBytes(20).toString('hex');

    const passResTempModel = {
        userId: user.id,
        token: token
    };

    sequelize.transaction().then(t => {
        PasswordResetterTemp.create(passResTempModel, {
            transaction: t
        }).then(() => {
            t.commit();

            //sending email
            onPasswordRecoveryRequestMail(insertedEmail, token);

        }).catch(error => {
            console.log(error);
            t.rollback();
        });
    });
};

exports.passwordRecoveryOnLinkActivation = async (req, res, next) => {
    if(req.query.token) return res.status(403).msg('TOKEN WAS NOT SENT');

    const token = req.query.token;

    const tokenExistence = await sequelize
        .query('EXEC CheckIfTokenForResettingPasswordExists :data',
            {replacements: { data: token} , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!tokenExistence) return res.status(403).msg('TOKEN WAS NOT FOUND');

    const userBoundToToken = await sequelize.query(`SELECT u.id, u.email FROM Users u JOIN PasswordResetterTemps 
        prt on u.id = prt.userId WHERE prt.token = :token`,
        { replacements: { token }, type: sequelize.QueryTypes.SELECT }).then(res => res);

    const newPassword = crypto.randomBytes(8).toString('hex');

    sequelize.transaction().then(t => {
        User.update({ password: newPassword }, {
            where: {
                id: userBoundToToken.id
            },
            transaction: t
        }).then(() => {
            t.commit();

            //sending email
            newPasswordSender(userBoundToToken.email, newPassword);
        }).catch(error => {
            console.log(error);
            t.rollback();
        });
    });
};

exports.emailConfirmation = async (req, res, next) => {
    const token = req.query.token;

    const tokenExistence = await sequelize
        .query('EXEC CheckIfTokenForEmailConfirmationExists :data',
            {replacements: { data: token } , type: sequelize.QueryTypes.SELECT})
        .then(res => res);

    if(!tokenExistence) return res.status(403).msg('TOKEN WAS NOT FOUND');

    sequelize.transaction().then(t => {
        EmailConfirmationTemp.destroy({
            where: {
                token: token
            },
            transaction: t
        }).then(() => {
            t.commit();

            req.session.prev_url_temp = req.baseUrl;

            res.redirect('/email-confirmation-success');
        }).catch(error => {
            console.log(error);
            t.rollback();
        });
    });
};

exports.emailAlteringConfirmation = (req, res, next) => {
    const newEmail = req.body.newEmail;
    const userActualEmail = req.session.user.email;

    const token = crypto.randomBytes(20).toString('hex');

    sequelize.transaction().then(t => {
        EmailAlteringConfirmationTemp.create({
            token: token,
            newEmail: newEmail,
            userId: req.session.user.id
        }, {
            transaction: t
        }).then(() => {
            t.commit();

            //sending email
            emailConfirmationLinkSender(userActualEmail, token);

        }).catch(error => {
            console.log(error);
            t.rollback();
        });
    });

    res.redirect('/settings?onemailaltering=true');
};
