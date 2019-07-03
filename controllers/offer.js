import Offer from "../models/offer";

exports.addNewOffer = (req, res, next) => {
    const newOffer = {
        sellerId: req.session.user.id,
        ...req.body,
        ...req.file
    };

    Offer.addNewOffer(newOffer);
};

exports.removeOffer = async (req, res, next) => {
    await Offer.removeOffer(req.query.id);

    res.redirect(req.get('referer'));
};
