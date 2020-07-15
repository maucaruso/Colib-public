const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Book');
const Book = mongoose.model('books');
require('../models/Post');
const Post = mongoose.model('posts');
require('../models/User');
const User = mongoose.model('users');
// Home
    router.get('/', (req, res) => {
        User.find({user_status: 1}).then((users) => {
            Book.find({visibility_status: 1}).sort({date: 'desc'}).limit(12).then((books) => {
                Post.find({visibility_status: 1}).sort({date: 'desc'}).limit(12).then((posts) => { 
                    res.render('site/index', {users: users.map(user => user.toJSON()), books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON()), pageInfo: 'home'}); 
                }).catch((err) =>{
                    req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
                });
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
        });
    });

// Biblioteca
    router.get('/biblioteca', (req, res) => {
        User.find({user_status: 1}).then((users) => {
            Book.find({visibility_status: 1}).sort({date: 'ascending'}).then((books) => {
                res.render('site/library', {users: users.map(user => user.toJSON()), books: books.map(book => book.toJSON()), pageInfo: 'library'}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os livros, por favor, tente novamente'); 
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
        });
    });

    router.get('/biblioteca/:id/:slug', (req, res) => {
        Book.findOne({_id:req.params.id, slug:req.params.slug, visibility_status: 1}).lean().then((book) => {
            if(book){
                res.render('site/library-details', {book: book, pageInfo: 'library-details'}); 
            } else {
                req.flash('error_msg', 'Este livro não existe');
                res.redirect('/biblioteca/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Este livro não existe');
            res.redirect('/biblioteca/');
        }); 
    });

// Artigos
    router.get('/artigos', (req, res) => {
        User.find({user_status: 1}).then((users) => {
            Post.find({visibility_status: 1}).sort({date: 'desc'}).then((posts) => {
                res.render('site/articles', {users: users.map(user => user.toJSON()), posts: posts.map(post => post.toJSON()), pageInfo: 'articles'}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os artigos, por favor, recarregue a página.'); 
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
        });
    });

    router.get('/artigos/:id/:slug', (req, res) => {
        Post.findOne({_id:req.params.id, slug:req.params.slug, visibility_status: 1}).lean().then((post) => {
            User.findOne({_id:post.user, user_status: 1}).lean().then((user_detail) => {
                if(user_detail){
                    var wallets;
                    if(user_detail.wallets != null && user_detail.wallets != undefined && user_detail.wallets != ''){
                        wallets = JSON.parse(user_detail.wallets);
                    } 
                    res.render('site/articles-details', {user_detail: user_detail, post: post, wallets: wallets, pageInfo: 'articles-details'}); 
                } else {
                    req.flash('error_msg', 'Este artigo não existe');
                    res.redirect('/artigos/');
                }  
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'+err); 
                res.redirect('/');
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Este artigo não existe');
            res.redirect('/artigos/');
        }); 
    });

    router.post('/artigos/curtir', (req, res) => {
        User.findOne({_id:req.body._id}).lean().then((user) => {
            if(user){
                Post.findOne({_id:req.body.post_id}).then((post) => {
                    if(post){
                        var getLikes = post.likes;
                        var verify = false;
                        if(getLikes != undefined || getLikes != null){
                            verify = getLikes.includes(user._id);
                        } else {
                            getLikes = [];
                        }
                        if(verify == false){
                            getLikes.push(user._id);
                            post.likes = getLikes; 
                        } else {
                            for(var key in getLikes){
                                if(getLikes[key] == user._id){
                                    getLikes.splice(key, 1);
                                }
                            }
                        }
                        post.save().then(() => {
                            var message = [];
                            if(verify == true){
                                message.push(false);
                                res.json(message);
                            } else {  
                                message.push(true);
                                res.json(message);
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro interno, tente novamente.'+err);
                            res.json(err);
                        });
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'+err); 
                    res.redirect('/');
                });
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente.'+err); 
            res.redirect('/');
        });
    });
// Página do Usuário
    router.get('/profile/:nickname', (req, res) => {
        User.findOne({nickname:req.params.nickname, access: 1, user_status: 1}).lean().then((user_detail) => {
            if(user_detail){
                Book.find({user: user_detail._id, visibility_status: 1}).sort({date: 'desc'}).then((books) => {
                    Post.find({user: user_detail._id, visibility_status: 1}).sort({date: 'desc'}).then((posts) => { 
                        res.render('site/profile-details', {user_detail: user_detail, books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON()), pageInfo: 'profile-details'}); 
                    }).catch((err) =>{
                        req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
                        res.redirect('/');
                    });
                }).catch((err) =>{
                    req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
                    res.redirect('/');
                });
            } else {
                req.flash('error_msg', 'Perfil não encontrado');
                res.redirect('/');
            } 
        }).catch((err) => {
            req.flash('error_msg', 'Perfil não encontrado');
            res.redirect('/');
        }); 
    });

// Pesquisa
    router.get('/search/', (req, res) => {
        var search_terms = req.query.find;
        User.find({user_status: 1}).then((users) => {
            Book.find({ $or:[ {'name':{$regex: search_terms, $options: "i"}}, {'author':{$regex: search_terms, $options: "i"}}, {'hashtags':{$regex: search_terms, $options: "i"}} ], visibility_status: 1}).sort({date: 'desc'}).then((books) => {
                Post.find({ $or:[ {'title':{$regex: search_terms, $options: "i"}}, {'hashtags':{$regex: search_terms, $options: "i"}} ], visibility_status: 1}).sort({date: 'desc'}).then((posts) => {
                    res.render('site/search-result', {books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON()), pageInfo: 'search-result'}); 
                }).catch((err) =>{
                    req.flash('error_msg', 'Houve um erro ao carregar a busca.'); 
                    res.redirect('/');
                }); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao carregar a busca.'); 
                res.redirect('/');
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a busca.'); 
            res.redirect('/');
        }); 
    });

module.exports = router; 