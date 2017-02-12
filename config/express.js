/**
 * Created by Vittorio on 30/05/2016.
 */

var config = require('./config');
var express = require('express');
var methodOverride = require('method-override');
var cors = require('cors');
var flash = require('connect-flash');
var path = require('path');
var morgan = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var session = require('express-session');

module.exports = function() {

    var app = express();

    if(process.env.NODE_env === 'development') {
        app.use(morgan('dev'));
    } else if(process.env.NODE_env === 'production') {
        app.use(compress());
    }

    app.use(methodOverride());
    app.use(cors());
    app.use(flash());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }));

    app.use(express.static('./public'));
    app.use(express.static('./app')); // Abriga as imagens upadas para o servidor.


    require('../app/routes/produtos.server.routes.js')(app);
    require('../app/routes/despesas.server.routes.js')(app);
    require('../app/routes/upload-files.server.routes')(app);
    require('../app/routes/hscode.server.routes.js')(app);
    require('../app/routes/fornecedores.server.routes')(app);
    require('../app/routes/paises.server.routes')(app);
    require('../app/routes/estados.server.routes')(app);
    require('../app/routes/cidades.server.routes')(app);
    require('../app/routes/estudos.server.routes')(app);
    require('../app/routes/contatos.server.routes')(app);
    require('../app/routes/categorias.server.routes')(app);
    
    return app;

};