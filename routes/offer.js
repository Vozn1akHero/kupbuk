import Offer from '../models/offer';
import * as authMiddleware from '../middleware/auth';
import upload from "../middleware/multer-settings";
import * as offerController from "../controllers/offer";
import express from "express";

const router = express.Router();

router.post('/new-offer', authMiddleware.checkSignedIn, upload.single("thumbnail"), offerController.addNewOffer);
router.post('/remove-offer', authMiddleware.checkSignedIn, offerController.removeOffer);

module.exports = router;
