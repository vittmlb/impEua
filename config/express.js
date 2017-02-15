/**
 * Created by Vittorio on 30/05/2016.
 */

let config = require('./config');
let express = require('express');
let methodOverride = require('method-override');
let cors = require('cors');
let flash = require('connect-flash');
let path = require('path');
let morgan = require('morgan');
let compress = require('compression');
let bodyParser = require('body-parser');
let session = require('express-session');

module.exports = function() {

    let app = express();

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
    require('../app/routes/embalagens.server.routes')(app);
    
    return app;

};