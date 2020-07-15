const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Post');
const Post = mongoose.model('posts');
require('../models/Book');
const Book = mongoose.model('books');
require('../models/User');
const User = mongoose.model('users');
require('../models/Group');
const Group = mongoose.model('groups');
const bctypt = require('bcryptjs');
const passport = require('passport');
const validatePost = require('../controller/validatePost');
const validateBook = require('../controller/validateBook');
const returnFile = require('../controller/returnFile');
const deleteFile = require('../controller/deleteFile');
const filterHashtags = require('../controller/filterHashtags');
const returnSlug = require('../controller/returnSlug');
const returnMetaDescription = require('../controller/returnMetaDescription');
const filterFileName =  require('../controller/filterFileName');
const validateRegisterEdit = require('../controller/validateRegisterEdit');
const {isAdmin} = require('../helpers/isAdmin.js');

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
                } else if(req.body.nickname){
                    // Se for perfil
                    cb(null, 'public/uploads/images/profile_pic'); 
                }
            } else {
                cb(null, 'public/uploads/files');
            }   
        },
        filename: (req, file, cb) => {
            if(req.body.name){
                // Se for livro
                var nameBook = returnSlug(filterFileName(req.body.name));
                cb(null, nameBook+'-'+Date.now()+path.extname(file.originalname));
            } else if(req.body.title){
                // Se for artigo
                var nameCover = returnSlug(filterFileName(req.body.title));
                cb(null, nameCover+'-'+Date.now()+path.extname(file.originalname));
            } else if(req.body.nickname){
                // Se for Usuário
                var profile_pic = returnSlug(filterFileName(req.body.nickname));
                cb(null, profile_pic+'-'+Date.now()+path.extname(file.originalname));
            }
        }
    }); 
    const upload = multer({storage});
    
// Home
    router.get('/', isAdmin, (req, res) => {
        res.redirect('/admin/library'); 
    });
// Biblioteca
    router.get('/library', isAdmin, (req, res) => {
        var show_only = req.query.only;
        if(show_only){
            Book.find({visibility_status: show_only}).sort({date: 'desc'}).then((books) => {
                res.render('admin/library', {books: books.map(book => book.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os livros, por favor, tente novamente.'); 
            }); 
        } else {
            Book.find().sort({date: 'desc'}).then((books) => {
                res.render('admin/library', {books: books.map(book => book.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os livros, por favor, tente novamente.'); 
            }); 
        }
    });
    
    router.get('/library/new-file', isAdmin, (req, res) => {
        res.render('admin/library-add');  
    });

    router.post('/library/add', isAdmin, upload.any('files'),(req, res) => { 
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
            deleteFile(cover);
            deleteFile(pdf);
            deleteFile(epub);
            deleteFile(mobi);
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
                file_mobi: mobi,
                user: res.locals.user._id
            }
            new Book(newBook).save().then(() => {
                req.flash('success_msg', 'Livro cadastrado com sucesso!');
                res.redirect('/admin/library');
            }).catch((err) => {
                deleteFile(cover);
                deleteFile(pdf);
                deleteFile(epub);
                deleteFile(mobi);
                req.flash('error_msg', 'Houve um erro cadastrar o livro, tente novamente.'+err);
                res.redirect('/admin/library/new-file');
            });
        }
    });

    router.get('/library/edit/:id', isAdmin, (req, res) => {
        Book.findOne({_id:req.params.id}).lean().then((book) => {
            res.render('admin/library-edit', {book: book}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este livro não existe');
            res.redirect('/admin/library/');
        });
        
    }); 

    router.post('/library/edit', isAdmin, upload.any('files'), (req, res) => {

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
            deleteFile(pdf);
            deleteFile(epub);
            deleteFile(mobi);
            deleteFile(cover);
            req.flash('error_msg', errors); 
            res.redirect('/admin/library/edit/'+req.body.id);
        } else {
            Book.findOne({_id:req.body.id}).then((book) => {
                book.name = req.body.name;
                book.author = req.body.author;
                book.hashtags = tags;
                book.description = req.body.description; 
                book.visibility_status = req.body.visibility_status;
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
                    deleteFile(pdf);
                    deleteFile(epub);
                    deleteFile(mobi);
                    deleteFile(cover);
                    req.flash('error_msg', 'Houve um erro interno ao editar o livro');
                    res.redirect('/admin/library/edit'+req.body.id);
                });
            }).catch((err) => {
                deleteFile(pdf);
                deleteFile(epub);
                deleteFile(mobi);
                deleteFile(cover);
                req.flash('error_msg', 'Houve um erro ao editar o livro');
                res.redirect('/admin/library');
            }); 
        }
    });

    
    router.post('/library/delete', isAdmin, (req, res) => {
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
    router.get('/articles', isAdmin, (req, res) => { 
        var show_only = req.query.only;
        if(show_only){
            Post.find({visibility_status: show_only}).then((posts) => {
                res.render('admin/articles', {posts: posts.map(post => post.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os artigos.'); 
            });  
        } else {
            Post.find().then((posts) => {
                res.render('admin/articles', {posts: posts.map(post => post.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os artigos.'); 
            });  
        }
    });

    router.get('/articles/new-article', isAdmin, (req, res) => {
        res.render('admin/articles-add');  
    });

    router.post('/articles/add', isAdmin, upload.any('files'), (req, res) => {
        var thumbnail = returnFile(req.files, 'img', 'thumbnails'); 
        var slug = returnSlug(req.body.title);
        var metadescription = returnMetaDescription(req.body.content);
        var tags = filterHashtags(req.body.hashtags);

        var errors = validatePost(req.body, thumbnail, false);

        if(errors.length > 0){
            deleteFile(thumbnail);
            req.flash('error_msg', errors); 
            res.redirect('/admin/articles/new-article/');
        } else { 
            const newPost = {
                title: req.body.title,
                slug: slug,
                hashtags: tags,
                thumbnail: thumbnail,
                description: metadescription,
                content: req.body.content,
                user: res.locals.user._id
            }
            new Post(newPost).save().then(() => {
                req.flash('success_msg', 'Artigo criado com sucesso!');
                res.redirect('/admin/articles');
            }).catch((err) => {
                deleteFile(thumbnail);
                req.flash('error_msg', 'Houve um erro ao salvar o artigo, tente novamente.'+err);
                res.redirect('/admin/articles/new-article');
            });
        }
    });

    router.get('/article/edit/:id', isAdmin, (req, res) => {
        Post.findOne({_id:req.params.id}).lean().then((post) => {
            res.render('admin/articles-edit', {post: post}); 
        }).catch((err) => {
            req.flash('error_msg', 'Este artigo não existe');
            res.redirect('/admin/articles/');
        });
        
    }); 

    router.post('/articles/edit', isAdmin, upload.any('files'), (req, res) => {
        var thumbnail = returnFile(req.files, 'img', 'thumbnails'); 
        var slug = returnSlug(req.body.title);
        var metadescription = returnMetaDescription(req.body.content);
        var tags = filterHashtags(req.body.hashtags);

        var errors = validatePost(req.body, thumbnail, false);
        if(errors.length > 0){
            deleteFile(thumbnail);
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
                post.visibility_status = req.body.visibility_status;
                post.save().then(() => {
                    req.flash('success_msg', 'Artigo editado com sucesso!');
                    res.redirect('/admin/articles');
                }).catch((err) => {
                    deleteFile(thumbnail);
                    req.flash('error_msg', 'Houve um erro interno ao salvar o artigo');
                    res.redirect('/admin/articles');
                });
            }).catch((err) => {
                deleteFile(thumbnail);
                req.flash('error_msg', 'Houve um erro ao editar o artigo');
                res.redirect('/admin/articles');
            });
        }
    });

    router.post('/articles/delete', isAdmin, (req, res) => {
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
    router.get('/medias', isAdmin, (req, res) => {
        res.render('admin/medias'); 
    });
// Configurações
    router.get('/settings', isAdmin, (req, res) => {
        User.findOne({_id:res.locals.user._id, nickname:res.locals.user.nickname}).lean().then((user) => {
            if(user){
                res.render('admin/settings', {user: user}); 
            }
        });
    });

    router.post('/settings/edit', isAdmin, upload.any('files'), (req, res) => { 
        var profile_picture = returnFile(req.files, 'img', 'profile_pic');
        var errors = validateRegisterEdit(req.body, profile_picture);

        if(errors.length > 0){
            deleteFile(profile_picture);
            req.flash('error_msg', errors); 
            res.redirect('/admin/settings');
        } else {
            User.findOne({nickname:res.locals.user.nickname}).then((user) => {
                if(req.body.password){
                    user.password = req.body.password;
                }
                if(profile_picture){
                    deleteFile(user.profile_picture); 
                    user.profile_picture = profile_picture;
                }
                if(req.body.profile_desc){
                    user.profile_desc = req.body.profile_desc;
                }
                if(req.body.password){
                    bctypt.genSalt(10, (error, salt) => {
                        bctypt.hash(user.password, salt, (error, hash) => {
                            if(error){
                                deleteFile(profile_picture);
                                req.flash('error_msg', 'Houve um erro ao salvar de seus dados, por favor, tente novamente');
                                res.redirect('/admin/settings');
                            } else {
                                user.password = hash;
                                user.save().then(() => {
                                    req.flash('success_msg', 'Perfil atualizado com sucesso!');
                                    res.redirect('/admin/settings');
                                }).catch((err) => {
                                    deleteFile(profile_picture);
                                    req.flash('error_msg', 'Houve um erro interno, tente novamente.'+err);
                                    res.redirect('/admin/settings');
                                });
                            }
                        });
                    });
                } else {
                    user.save().then(() => {
                        req.flash('success_msg', 'Perfil atualizado com sucesso!');
                        res.redirect('/admin/settings');
                    }).catch((err) => {
                        deleteFile(profile_picture);
                        req.flash('error_msg', 'Houve um erro interno, tente novamente.'+err);
                        res.redirect('/admin/settings');
                    });
                }
            }).catch((err) => {
                deleteFile(profile_picture);
                req.flash(('error_msg', 'Houve um erro interno, por favor, tente novamente.'+err));
                res.redirect('/admin/settings');
            });
        }
    });
// Gerenciamento de Usuários
    router.get('/users', isAdmin, (req, res) => { 
        var onlyUser = req.query.find;
        if(onlyUser){
            User.find({nickname: onlyUser}).then((users) => {
                res.render('admin/users', {users: users.map(user => user.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os usuários.'); 
            });  
        } else {
            User.find().then((users) => {
                res.render('admin/users', {users: users.map(user => user.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os usuários.'); 
            });  
        }
    });

    router.post('/users/edit', isAdmin, (req, res) => { 
        User.findOne({_id:req.body._id}).then((user_edit) => {
            // res.json(user_edit);
            if(user_edit.nickname != 'maurici'){
                if(req.body.access){
                    user_edit.access = req.body.access;
                }
                if(req.body.user_status){
                    user_edit.user_status = req.body.user_status;
                }
                user_edit.save().then(() => {
                    req.flash('success_msg', 'Perfil atualizado com sucesso!');
                    res.redirect('/admin/users');
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno, tente novamente.'+err);
                    res.redirect('/admin/users');
                });
            } else {
                req.flash('error_msg', 'Ação não permitida');
                res.redirect('/admin/users/');
            }
        });
    });

    router.post('/users/delete', isAdmin, (req, res) => { 
        if(req.body.remove_id != '5ed26d68e0ef6f47f0c2dc0a'){
            User.findOne({_id: req.body.remove_id}).then((user) => { 
                if(user){
                    if(user.profile_picture != '' && user.profile_picture != null && user.profile_picture != undefined){
                        deleteFile(user.profile_picture);
                    }
                    // Ao deletar o usuário, primeiro são removidos todos os artigos associados, após os livros e por fim o usuário
                    Post.find({user: req.body.remove_id}).then((posts) => {
                        for(var key in posts){
                            deleteFile(posts[key].thumbnail); 
                        }
                        Post.deleteMany({user: req.body.remove_id}).then(() => {
                            // Deletando livros
                            Book.find({user: req.body.remove_id}).then((books) => {
                                for(var key in books){
                                    // deletando arquivos de uploads
                                    deleteFile(books[key].cover); 
                                    deleteFile(books[key].file_pdf);  
                                    deleteFile(books[key].file_epub); 
                                    deleteFile(books[key].file_mobi); 
                                }
                                Book.deleteMany({user: req.body.remove_id}).then(() => {
                                    User.remove({_id: req.body.remove_id}).then(() => {
                                        req.flash('success_msg', 'Usuário removido com sucesso!');
                                        res.redirect('/admin/users/');
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao excluír o usuário');
                                        res.redirect('/admin/users/');
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve um erro ao excluir os livros');
                                    res.redirect('/admin/users/');
                                }); 
                            }).catch(() => {
                                req.flash('error_msg', 'Houve um erro ao excluir os livros');
                                res.redirect('/admin/users/');
                            });
                        }).catch(() => {
                            req.flash('error_msg', 'Houve um erro ao excluir os artigos');
                            res.redirect('/admin/users/');
                        });
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao excluir os artigos');
                        res.redirect('/admin/users/');
                    });
                }
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao remover o usuario.'); 
            });  
        } else {
            req.flash('error_msg', 'Este usuário não pode ser removido.'); 
            res.redirect('/admin/users');
        }
    });

// Comunidades
    router.get('/groups', isAdmin, (req, res) => { 
        var show_only = req.query.only;
        if(show_only){
            Group.find({visibility_status: show_only}).then((groups) => {
                res.render('admin/groups', {groups: groups.map(group => post.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os grupos.'); 
            });  
        } else {
            Group.find().then((groups) => {
                res.render('admin/groups', {groups: groups.map(group => group.toJSON())}); 
            }).catch((err) =>{
                req.flash('error_msg', 'Houve um erro ao listar os grupos.'); 
            });  
        }
    });
    router.get('/groups/new-group', isAdmin, (req, res) => {
        res.render('admin/groups-add');  
    });

module.exports = router;