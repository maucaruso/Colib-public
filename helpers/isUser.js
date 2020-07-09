module.exports = {
    isUser: function(req, res, next){
        if(req.isAuthenticated() && req.user.access == 1){
            return next();
        }
        req.flash('error_msg', 'Faça login para acessar o painel.');
        res.redirect('/user/login');
    }
}