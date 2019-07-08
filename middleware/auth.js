exports.checkSignedIn = (req, res, next) => {
    if(typeof req.session.isLoggedIn !== 'undefined' && req.session.isLoggedIn){
        next();
    } else {
        res.redirect('/login');
    }
};

exports.checkNotSignedIn = (req, res, next) => {
    if(!req.session.isLoggedIn || typeof req.session.isLoggedIn === 'undefined'){
        next();
    } else {
        res.redirect('/shop');
    }
};

