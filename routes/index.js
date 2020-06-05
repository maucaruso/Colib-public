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
            Book.find().sort({date: 'desc'}).limit(10).then((books) => {
                Post.find().sort({date: 'desc'}).limit(10).then((posts) => { 
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
        Book.find().sort({date: 'desc'}).then((books) => {
            res.render('site/library', {books: books.map(book => book.toJSON())}); 
        }).catch((err) =>{
            req.flash('error_msg', 'Houve um erro ao listar os livros, por favor, tente novamente'); 
        }); 
    });

    router.get('/biblioteca/:id/:slug', (req, res) => {
        Book.findOne({_id:req.params.id, slug:req.params.slug}).lean().then((book) => {
            res.render('site/library-details', {book: book}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este livro não existe');
            res.redirect('/biblioteca/');
        }); 
    });

// Artigos
    router.get('/artigos', (req, res) => {
        Post.find().sort({date: 'desc'}).then((posts) => {
            res.render('site/articles', {posts: posts.map(post => post.toJSON())}); 
        }).catch((err) =>{
            req.flash('error_msg', 'Houve um erro ao listar os artigos, por favor, recarregue a página.'); 
        }); 
    });

    router.get('/artigos/:id/:slug', (req, res) => {
        Post.findOne({_id:req.params.id, slug:req.params.slug}).lean().then((post) => {
            res.render('site/articles-details', {post: post}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este livro não existe');
            res.redirect('/artigos/');
        }); 
    });
// Página do Usuário
    router.get('/profile/:nickname', (req, res) => {
        User.findOne({nickname:req.params.nickname}).lean().then((user) => {
            if(user){
                res.render('site/articles-details', {post: post});
            } else {
                req.flash('error_msg', 'Perfil não encontrado');
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Perfil não encontrado');
            res.redirect('/');
        }); 
    });

module.exports = router; 