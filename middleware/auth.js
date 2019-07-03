exports.checkSignedIn = (req, res, next) => {
    if(typeof req.session.isLoggedIn !== 'undefined' && req.session.isLoggedIn){
        next();
    } else {
        return res.redirect('/login'); //to fix
    }
};

exports.checkNotSignedIn = (req, res, next) => {
    if(!req.session.isLoggedIn || typeof req.session.isLoggedIn === 'undefined'){
        next();
    } else {
        return res.redirect('/shop');
    }
};

