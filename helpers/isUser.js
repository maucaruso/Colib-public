module.exports = {
    isUser: function(req, res, next){
        if(req.isAuthenticated() && req.user.access == 1){
            return next();
        }
        req.flash('error_msg', 'Você não tem permissão para acessar esta área');
        res.redirect('/');
    }
}