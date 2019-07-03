import User from "../models/user";

exports.updateAvatar = async (req, res, next) => {
    const newAvatar = `/uploads/${req.file.filename}`;

    await User.updateAvatar(req.session.user.id, newAvatar);

    req.session.user.userAvatar = newAvatar;

    res.redirect(req.get('referer'));
};
