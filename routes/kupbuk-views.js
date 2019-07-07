import express from 'express'

import * as kupbukController from '../controllers/kupbuk-views'

import * as authMiddleware from '../middleware/auth'


const router = express.Router();

router.get('/', authMiddleware.checkNotSignedIn, kupbukController.getIndex);
router.get('/book', kupbukController.getBookPage);
router.get('/shop/:category?/:page?', kupbukController.getShopPage);
router.get('/search', kupbukController.getSearchPage);
router.get('/me', authMiddleware.checkSignedIn, kupbukController.getUserPage);
router.get('/new-offer', authMiddleware.checkSignedIn, kupbukController.getNewOfferPage);
router.get('/settings', authMiddleware.checkSignedIn, kupbukController.getSettingsPage);
router.get('/login', authMiddleware.checkNotSignedIn, kupbukController.getLoginPage);
router.get('/password-recovery', authMiddleware.checkNotSignedIn, kupbukController.getPasswordRecoveryPage);
router.get('/email-confirmation-success', authMiddleware.checkNotSignedIn, kupbukController.getEmailConfirmationSuccessPage);


module.exports = router;
