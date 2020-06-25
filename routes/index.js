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
        User.find().then((users) => {
            Book.find({visibility_status: 1}).sort({date: 'desc'}).limit(10).then((books) => {
                Post.find({visibility_status: 1}).sort({date: 'desc'}).limit(10).then((posts) => { 
                    res.render('site/index', {users: users.map(user => user.toJSON()), books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON())}); 
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
        User.find().then((users) => {
            Book.find({visibility_status: 1}).sort({date: 'desc'}).then((books) => {
                res.render('site/library', {users: users.map(user => user.toJSON()), books: books.map(book => book.toJSON())}); 
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
                res.render('site/library-details', {book: book}); 
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
        User.find().then((users) => {
            Post.find({visibility_status: 1}).sort({date: 'desc'}).then((posts) => {
                res.render('site/articles', {users: users.map(user => user.toJSON()), posts: posts.map(post => post.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os artigos, por favor, recarregue a página.'); 
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
        });
    });

    router.get('/artigos/:id/:slug', (req, res) => {
        Post.findOne({_id:req.params.id, slug:req.params.slug, visibility_status: 1}).lean().then((post) => {
            User.findOne({_id:post.user}).lean().then((user_detail) => {
                res.render('site/articles-details', {user_detail: user_detail, post: post}); 
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao carregar a página, por favor, tente novamente'); 
                res.redirect('/');
            });
        }).catch((err) => {
            req.flash('error_msg', 'Este artigo não existe');
            res.redirect('/artigos/');
        }); 
    });
// Página do Usuário
    router.get('/profile/:nickname', (req, res) => {
        User.findOne({nickname:req.params.nickname, access: 1}).lean().then((user_detail) => {
            if(user_detail){
                Book.find({user: user_detail._id}).sort({date: 'desc'}).then((books) => {
                    Post.find({user: user_detail._id}).sort({date: 'desc'}).then((posts) => { 
                        res.render('site/profile-details', {user_detail: user_detail, books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON())}); 
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
        User.find().then((users) => {
            Book.find({ $or:[ {'name':{$regex: search_terms, $options: "i"}}, {'author':{$regex: search_terms, $options: "i"}}, {'hashtags':{$regex: search_terms, $options: "i"}} ]}).sort({date: 'desc'}).then((books) => {
                Post.find({ $or:[ {'title':{$regex: search_terms, $options: "i"}}, {'hashtags':{$regex: search_terms, $options: "i"}} ]}).sort({date: 'desc'}).then((posts) => {
                    res.render('site/search-result', {books: books.map(book => book.toJSON()), posts: posts.map(post => post.toJSON())}); 
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