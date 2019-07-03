import express from 'express'

import * as authController from '../controllers/auth'
import * as authMiddleware from '../middleware/auth'

const router = express.Router();

router.post('/login', authController.logIn);
router.post('/joinup', authController.joinUp);
router.post('/logout', authMiddleware.checkSignedIn, authController.logOut);
router.post('/change-password', authMiddleware.checkSignedIn, authController.changePassword);
router.post('/change-email', authMiddleware.checkSignedIn, authController.changeEmail);

module.exports = router;
