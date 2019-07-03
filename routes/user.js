import * as authMiddleware from '../middleware/auth';
import * as userController from "../controllers/user";
import express from "express";
import upload from "../middleware/multer-settings";

const router = express.Router();

router.post('/update-avatar', authMiddleware.checkSignedIn,  upload.single("new-avatar"), userController.updateAvatar);

module.exports = router;
