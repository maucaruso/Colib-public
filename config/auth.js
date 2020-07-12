const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model de usuário
    require('../models/User');
    const User = mongoose.model('users');

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if(user.verified == '1'){
                if(!user){
                    return done(null, false, {message: 'E-mail ou senha incorretos.'});
                } else {
                    bcrypt.compare(password, user.password, (error, sucess) => {
                        if(sucess){
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'E-mail ou senha incorretos.'}); 
                        }
                    });
                }
            } else {
                return done(null, false, {message: 'Você precisa verificar sua conta através do e-mail que te enviamos para acessar o painel.'});
            }     
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

}