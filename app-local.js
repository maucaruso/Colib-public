// Carregando módilos
const express = require('express');
// const secure = require('express-force-https');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const user = require('./routes/user');
const admin = require('./routes/admin');
const index = require('./routes/index');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { get } = require('http');
require('./config/auth')(passport);
const nodemailer = require('nodemailer');

// Configurações

// Sessão
    app.use(session({
        secret: 'sucesso',
        resave: true,
        saveUninitialized: true
    })); 

    app.use(passport.initialize());
    app.use(passport.session()); 

    app.use(flash());
// Middleware para trabalho com sessões
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg'); 
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        res.locals.CurrentUrl = req.baseUrl+req.url;
        next();
    });
// Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
// Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    // Criação de Helpers customizados 
        var hbs = handlebars.create({});
        // Helper para verificar se valores são iguais
            hbs.handlebars.registerHelper('if_eq', function(a, b, opts) { 
                if(a != undefined && b != undefined){
                    if (a.toString() == b.toString()) {
                        return opts.fn(this);
                    } else {
                        return opts.inverse(this);
                    }
                } else {
                    return opts.inverse(this);
                }
            });
        // Helper para dar replace em uma stirng
            hbs.handlebars.registerHelper('replace', function( find, replace, options) {
                var string = options.fn(this);
                return string.replace( find, replace );
            });
        // Helper para buscar valor em um Array
            hbs.handlebars.registerHelper('if_eq_Array', function(a, b, opts) { 
                if(a != undefined && b != undefined){
                    var returnFind = false;
                    for(var key in b){
                        if(a == b[key]){
                            returnFind = true;
                        }
                    }
                    if(returnFind == true){
                        return opts.fn(this); 
                    } else {
                        return opts.inverse(this);
                    }
                } else {
                    return opts.inverse(this);
                }
            });
        // Helper para retornar JSON
            hbs.handlebars.registerHelper('jsons', function(context) {
                return JSON.stringify(context);
            });
        // criar vars
            hbs.handlebars.registerHelper("setVar", function(varName, varValue, options) {
                options.data.root[varName] = varValue;
            });
        // TODO Deixar menu lateral ativo na categoria que esteja sendo vizualizada
        // Helper para identificar quando está no painel para trazer recursos diferentes
            hbs.handlebars.registerHelper('if_adm', function(req) {
                var getPage = req.data.exphbs.view;
                if(getPage.match(/(admin)\//)){
                    return req.fn(this);
                } else {
                    return req.inverse(this);
                }
            });
            hbs.handlebars.registerHelper('if_user', function(req) {
                var getPage = req.data.exphbs.view;
                if(getPage.match(/(user)\//)){
                    return req.fn(this);
                } else {
                    return req.inverse(this);
                }
            });
        // Helper para caso condição não seja atendida
            hbs.handlebars.registerHelper('if_not', function(target, items, opts) { 
                var notFound = false;
                var splitItems = items.replace(/ /g, '').split(',');
                for(var key in splitItems){
                    if(target == splitItems[key]){
                        notFound = true;
                    }
                }
                if(notFound == true){
                    return opts.inverse(this);
                } else {
                    return opts.fn(this);
                }
            });
        // Helper truncate strings
            hbs.handlebars.registerHelper('trimString', function(passedString) {
                var theString = passedString.replace(/<[^>]*>/g, '').substring(0,150);
                return new hbs.handlebars.SafeString(theString)
            });
// Mongoose
    mongoose.Promisse = global.Promise;
    mongoose.connect('mongodb://localhost/baseapp', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
        console.log('conectado com sucesso ao mongo!')
    }).catch(() => {
        console.log('erro ao se conectar');
    });
// Public - configurando pasta "public" que contem css, js e img
    app.use(express.static(path.join(__dirname, 'public'))); 

// Rotas
// Rotas do site
    app.use('/', index);
// Rotas do painel de administração
    app.use('/admin', admin);
// Rotas do painel de usuários
    app.use('/user', user);
// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor Iniciado');
});