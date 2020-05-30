const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');
const validateRegister = require('../controller/validateRegister');
const bctypt = require('bcryptjs');
const passport = require('passport');

require('../models/Post');
const Post = mongoose.model('posts');
require('../models/Book');
const Book = mongoose.model('books');
const validatePost = require('../controller/validatePost');
const validateBook = require('../controller/validateBook');
const returnFile = require('../controller/returnFile');
const deleteFile = require('../controller/deleteFile');
const filterHashtags = require('../controller/filterHashtags');
const returnSlug = require('../controller/returnSlug');
const returnMetaDescription = require('../controller/returnMetaDescription');
const filterFileName =  require('../controller/filterFileName');
const {isUser} = require('../helpers/isUser.js');

// Login e Registro
    router.get('/login', (req, res) => {
        res.render('users/login');
    });

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuario/login',
            failureFlash: true
        })(req, res, next);
    });

    router.get('/logout', (req, res) => {
        req.logOut();
        req.flash('success_msg', 'Logout realizado com sucesso!');
        res.redirect('/');
    });
    
    router.post('/login/register', (req, res) => {

        var errors = validateRegister(req.body);

        if(errors.length > 0){
            req.flash('error_msg', errors); 
            res.redirect('/usuario/login');
        } else { 
            var errorsUnique = [];
            User.findOne({email: req.body.register_email}).then((email) => {
                User.findOne({nickname: req.body.register_nickname}).then((nickname) => {
                    if(email){
                        errorsUnique.push({text: 'O e-mail '+email.email+' já foi cadastrado, por favor, escolha outro.'});
                    }
                    if(nickname){
                        errorsUnique.push({text: 'Alguém já está utilizando o apelido '+nickname.nickname+', por favor, escolha outro.'});
                    }
                    if(errorsUnique.length > 0){
                        req.flash('error_msg', errorsUnique);
                        res.redirect('/usuario/login');
                    } else {
                        const newUser = {
                            name: req.body.register_name,
                            nickname: req.body.register_nickname,
                            email: req.body.register_email,
                            password: req.body.register_password
                        }

                        bctypt.genSalt(10, (error, salt) => {
                            bctypt.hash(newUser.password, salt, (error, hash) => {
                                if(error){
                                    req.flash('error_msg', 'Houve um erro durante o salvamento de seus dados, por favor, tente novamente');
                                    res.redirect('/usuario/login');
                                } else {
                                   newUser.password = hash;
                                   new User(newUser).save().then(() => {
                                        req.flash('success_msg', 'Cadastro realizado com sucesso!');
                                        res.redirect('/usuario/login');
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro interno, tente novamente.'+err);
                                        res.redirect('/usuario/login');
                                    });
                                }
                            });
                        });
                    }
                }).catch((err) => {
                    req.flash(('error_msg', 'Houve um erro interno, por favor, tente novamente.'));
                    res.redirect('/usuario/login');
                });
            }).catch((err) => {
                req.flash(('error_msg', 'Houve um erro interno, por favor, tente novamente.'));
                res.redirect('/usuario/login');
            });
        }
    });
// Telas do painel de Usuário

module.exports = router;