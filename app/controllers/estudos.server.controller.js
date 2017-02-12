/**
 * Created by Vittorio on 15/08/2016.
 */
var Estudos = require('mongoose').model('Estudo');
var produtos = require('./produtos.server.controller');

exports.create = function(req, res) {
    var estudo = new Estudos(req.body);
    estudo.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            add_estudo(req, res, estudo);
            res.json(estudo);
        }
    });
};

exports.list = function(req, res) {
    Estudos.find().populate({path: 'produtosDoEstudo.produto_ref'}).exec(function (err, estudos) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(estudos);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.estudo);
};

exports.findById = function(req, res, next, id) {
    Estudos.findById(id).populate({path: 'produtosDoEstudo.produto_ref'}).exec(function (err, estudo) {
        if(err) return next(err);
        if(!estudo) return next(new Error(`Failed to load estudo id: ${id}`));
        req.estudo = estudo;
        next();
    });
};

exports.update = function(req, res) {
    var estudo = req.estudo;
    estudo.cotacao_dolar = req.body.cotacao_dolar;
    estudo.config = req.body.config;
    estudo.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(estudo);
        }
    });
};

exports.delete = function(req, res) {
    var estudo = req.estudo;
    estudo.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(estudo);
        }
    });
};

function add_estudo(req, res, estudo) {
    var estudo_id = estudo._id;
    estudo.produtosDoEstudo.forEach(function (data) {
        req.params.produtoId = data.produto_ref;
        req.params.estudoId = estudo_id;
        produtos.update_produto_do_estudo(req, res);
    });
}