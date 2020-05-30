const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
// Multer - Upload de arquivos
    const path = require('path');
    const multer = require('multer');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if(path.extname(file.originalname) == '.jpg' || path.extname(file.originalname) == '.png'){
                if(req.body.name){
                    // Se for livro
                    cb(null, 'public/uploads/images'); 
                } else if(req.body.title){
                    // Se for artigo
                    cb(null, 'public/uploads/images/thumbnails'); 
                }
            } else {
                cb(null, 'public/uploads/files');
            }   
        },
        filename: (req, file, cb) => {
            if(req.body.name){
                // Se for livro
                var nameBook = filterFileName(req.body.name);
                cb(null, nameBook+'-'+Date.now()+path.extname(file.originalname));
            } else if(req.body.title){
                // Se for artigo
                var nameCover = filterFileName(req.body.title);
                cb(null, nameCover+'-'+Date.now()+path.extname(file.originalname));
            }
        }
    }); 
    const upload = multer({storage});
    
// Home
    router.get('/', (req, res) => {
        res.render('admin/index'); 
    });
// Biblioteca
    router.get('/library', (req, res) => {
        Book.find().sort({date: 'desc'}).then((books) => {
            res.render('admin/library', {books: books.map(book => book.toJSON())}); 
        }).catch((err) =>{
            req.flash('error_msg', 'Houve um erro ao listar os livros, por favor, tente novamente.'); 
        }); 
    });
    router.get('/library/new-file', (req, res) => {
        res.render('admin/library-add');  
    });
    router.post('/library/add',upload.any('files'),(req, res) => { 
        // Verificando quais arquivos foram enviados
        var filesToValidade = [];
        var pdf = returnFile(req.files, 'pdf');
        var epub = returnFile(req.files, 'epub');
        var mobi = returnFile(req.files, 'mobi');  
        var cover = returnFile(req.files, 'img'); 
        filesToValidade.push(pdf,epub,mobi);
        // Fim verificando quais arquivos foram enviados
        
        // Separando as Hashtags dentro de um array
        var tags = filterHashtags(req.body.hashtags);
        var slug = returnSlug(req.body.name);
        var errors = validateBook(req.body, cover, filesToValidade, true);
        
        if(errors.length > 0){
            req.flash('error_msg', errors); 
            res.redirect('/admin/library/new-file/'); 
        } else {
           // Criando objeto Livro
            const newBook = {
                name: req.body.name,
                slug: slug,
                author: req.body.author,
                hashtags: tags,
                description: req.body.description,
                cover: cover, 
                file_pdf: pdf, 
                file_epub: epub,
                file_mobi: mobi
            }
            new Book(newBook).save().then(() => {
                req.flash('success_msg', 'Livro cadastrado com sucesso!');
                res.redirect('/admin/library');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro cadastrar o livro, tente novamente.');
                res.redirect('/admin/library/new-file');
            });
        }
    });

    router.get('/library/edit/:id', (req, res) => {
        Book.findOne({_id:req.params.id}).lean().then((book) => {
            res.render('admin/library-edit', {book: book}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este livro não existe');
            res.redirect('/admin/library/');
        });
        
    }); 

    router.post('/library/edit', upload.any('files'), (req, res) => {

        var filesToValidade = [];
        var pdf = returnFile(req.files, 'pdf');
        var epub = returnFile(req.files, 'epub');
        var mobi = returnFile(req.files, 'mobi');  
        var cover = returnFile(req.files, 'img'); 
        if(pdf != undefined || epub != undefined || mobi != undefined){
            filesToValidade.push(pdf,epub,mobi);
        }
        // Separando as Hashtags dentro de um array
        var tags = filterHashtags(req.body.hashtags);

        var errors = validateBook(req.body, cover, filesToValidade, false); 
    
        if(errors.length > 0){
            req.flash('error_msg', errors); 
            res.redirect('/admin/library/edit/'+req.body.id);
        } else {
            Book.findOne({_id:req.body.id}).then((book) => {
                book.name = req.body.name;
                book.author = req.body.author;
                book.hashtags = tags;
                book.description = req.body.description; 
                if(cover){
                    // Deletando arquivo antigo antes de atruibuir novo valor na base de dados
                    deleteFile(book.cover); 
                    book.cover = cover;
                }
                if(pdf){
                    deleteFile(book.file_pdf); 
                    book.file_pdf = pdf;
                }
                if(epub){
                    deleteFile(book.file_epub); 
                    book.file_epub = epub;
                }
                if(mobi){
                    deleteFile(book.file_mobi); 
                    book.file_mobi = mobi;
                }
                book.save().then(() => {
                    req.flash('success_msg', 'Livro editado com sucesso!');
                    res.redirect('/admin/library/edit/'+req.body.id);
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno ao editar o livro');
                    res.redirect('/admin/library/edit'+req.body.id);
                });
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar o livro');
                res.redirect('/admin/library');
            });
        }
    });

    
    router.post('/library/delete', (req, res) => {
        Book.findOne({_id:req.body.id}).then((book) => {
            // deletando arquivos de uploads
            deleteFile(book.cover); 
            deleteFile(book.file_pdf);  
            deleteFile(book.file_epub); 
            deleteFile(book.file_mobi); 
            Book.remove({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Livro excluído com sucesso!');
                res.redirect('/admin/library/');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao excluir o livro');
                res.redirect('/admin/library/');
            }); 
        }).catch(() => {
            req.flash('error_msg', 'Houve um erro ao excluir o os arquivos');
            res.redirect('/admin/library/');
        });
    });
// Posts
    router.get('/articles', (req, res) => { 
        Post.find().then((posts) => {
            res.render('admin/articles', {posts: posts.map(post => post.toJSON())}); 
        }).catch((err) =>{
            req.flash('error_msg', 'Houve um erro ao listar os artigos.'); 
        });  
    });

    router.get('/articles/new-article', (req, res) => {
        res.render('admin/articles-add');  
    });

    router.post('/articles/add',upload.any('files'), (req, res) => {
        var thumbnail = returnFile(req.files, 'img', 'thumbnails'); 
        var slug = returnSlug(req.body.title);
        var metadescription = returnMetaDescription(req.body.content);
        var tags = filterHashtags(req.body.hashtags);

        var errors = validatePost(req.body, thumbnail, false);

        if(errors.length > 0){
            req.flash('error_msg', errors); 
            res.redirect('/admin/articles/new-article/');
        } else { 
            const newPost = {
                title: req.body.title,
                slug: slug,
                hashtags: tags,
                thumbnail: thumbnail,
                description: metadescription,
                content: req.body.content
            }
            new Post(newPost).save().then(() => {
                req.flash('success_msg', 'Artigo criado com sucesso!');
                res.redirect('/admin/articles');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar o artigo, tente novamente.'+err);
                res.redirect('/admin/articles/new-article');
            });
        }
    });

    router.get('/article/edit/:id', (req, res) => {
        Post.findOne({_id:req.params.id}).lean().then((post) => {
            res.render('admin/articles-edit', {post: post}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este artigo não existe');
            res.redirect('/admin/articles/');
        });
        
    }); 

    router.post('/articles/edit',upload.any('files'), (req, res) => {
        var thumbnail = returnFile(req.files, 'img', 'thumbnails'); 
        var slug = returnSlug(req.body.title);
        var metadescription = returnMetaDescription(req.body.content);
        var tags = filterHashtags(req.body.hashtags);

        var errors = validatePost(req.body, thumbnail, false);
        if(errors.length > 0){
            req.flash('error_msg', errors); 
            res.redirect('/admin/articles/edit/'+req.body.id);
        } else {
            Post.findOne({_id:req.body.id}).then((post) => {
                post.title = req.body.title;
                post.slug = slug;
                post.hashtags = tags;
                if(thumbnail != null && thumbnail != undefined && thumbnail != ''){
                    // Deletando arquivo antigo antes de atruibuir novo valor na base de dados
                    deleteFile(post.thumbnail); 
                    post.thumbnail = thumbnail;
                }
                post.description = metadescription;
                post.content = req.body.content;
                post.save().then(() => {
                    req.flash('success_msg', 'Artigo editado com sucesso!');
                    res.redirect('/admin/articles');
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno ao salvar o artigo');
                    res.redirect('/admin/articles');
                });
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar o artigo');
                res.redirect('/admin/articles');
            });
        }
    });

    router.post('/articles/delete', (req, res) => {
        Post.findOne({_id:req.body.id}).then((post) => {
            // deletando arquivos de uploads
            deleteFile(post.thumbnail); 
            Post.remove({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Artigo excluído com sucesso!');
                res.redirect('/admin/articles/');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao excluir o artigo');
                res.redirect('/admin/articles/');
            }); 
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao excluir o artigo');
            res.redirect('/admin/articles/');
        });
    });
// Mídias
    router.get('/medias', (req, res) => {
        res.render('admin/medias'); 
    });
// Configurações
    router.get('/settings', (req, res) => {
        res.render('admin/settings'); 
    });

module.exports = router;