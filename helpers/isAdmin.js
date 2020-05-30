module.exports = {
    isAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.access == 2){
            return next();
        }
        req.flash('error_msg', 'Você não tem permissão para acessar esta área');
        res.redirect('/');
    }
}