import Offer from '../models/offer'
import User from '../models/user'

import * as bookPageScripts from './../public/js/views/book-page';
import * as userPageScripts from './../public/js/views/user-page';


import {format} from "date-fns";

exports.getIndex = (req, res, next) => {
    res.render('kupbuk/index');
};

exports.getBookPage = async (req, res, next) => {
    const bookId = +req.query.id;
    const book = await Offer.getOffer(bookId);

    if(book === null) return res.redirect('/shop');

    res.render('kupbuk/book', {
        book: {
            ...book,
            publishDate: format(book.publishDate, 'YYYY-MM-DD HH:MM')
        },
        loggedIn: req.session.isLoggedIn,
        bookPageScripts: bookPageScripts
    })
};

exports.getShopPage = async (req, res, next) => {
    if(!req.params.category || !req.params.page) return res.redirect(`/shop/all/1`);

    const rangeStart = (req.params.page - 1) * 9;
    const rangeEnd = req.params.page * 9;
    const amountOfBooksOfCategory = await Offer.getCount(req.params.category);
    const maxAmountOfPages = Math.ceil(amountOfBooksOfCategory / 9);
    const books = await Offer.getOffers(req.params.category, rangeStart, rangeEnd);

    res.render('kupbuk/shop', {
        books: books.length !== 0 ? books : null,
        currentPageNum: req.params.page,
        maxAmountOfPages: maxAmountOfPages === 0 ? 1 : maxAmountOfPages,
        loggedIn: req.session.isLoggedIn
    })
};

exports.getSearchPage = async (req, res, next) => {
    const searchPhrase = req.query.phrase;

    const books = await Offer.findOffers(searchPhrase);

    res.render('kupbuk/search', {
        foundBooks: books.length !== 0 ? books : null,
        loggedIn: req.session.isLoggedIn
    })
};

exports.getUserPage = async (req, res, next) => {
    res.render('kupbuk/user', {
        user: await User.getUser(req.session.user),
        userPageScripts: userPageScripts
    })
};

exports.getNewOfferPage = (req, res, next) => {
    res.render('kupbuk/new-offer');
};

exports.getLoginPage = (req, res, next) => {
    const warningsExistence = req.query && (req.query.inc_pass === "true" ||
        req.query.reg_suc === "true" ||
        req.query.email_wasnt_confirmed === "true");

    res.render('kupbuk/auth/login/login', {
        warningsExistence,
        onPasswordIncorrectness: req.query.inc_pass === "true",
        onNewlyCreatedUser: req.query.reg_suc === "true",
        onEmailConfirmationStatusError: req.query.email_wasnt_confirmed === "true"
    });
};

exports.getSettingsPage = (req, res, next) => {
    const warningsExistence = req.query &&
        (req.query.onemailaltering === "true");

    res.render('kupbuk/settings/settings', {
        warningsExistence,
        onEmailAltering: req.query.onemailaltering === "true"
    });
};

exports.getPasswordRecoveryPage = (req, res, next) => {
    res.render('kupbuk/auth/password-recovery');
};

exports.getEmailConfirmationSuccessPage = (req, res, next) => {
    if(req.session.prev_url_temp !== '/confirm-email') return res.redirect('/shop');

    res.render('kupbuk/auth/email-confirmation-success');
};
