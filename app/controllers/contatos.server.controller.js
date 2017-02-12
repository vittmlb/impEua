/**
 * Created by Vittorio on 01/09/2016.
 */
var Contatos = require('mongoose').model('Contato');
var fornecedores = require('../controllers/fornecedores.server.controller');

exports.create = function(req, res) {
    var contato = new Contatos(req.body);
    contato.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            add_fornecedor(req, res, contato).then(function() {
                res.json(contato);
            });
        }
    });
};

exports.read = function(req, res) {
    res.json(req.contato);
};

exports.list = function(req, res) {
    Contatos.find().exec(function (err, contatos) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(contatos);
        }
    });
};

exports.findById = function(req, res, next, id) {
    Contatos.findById(id).populate('fornecedor').exec(function (err, contato) {
        if(err) return next(err);
        if(!contato) return next(new Error(`Failed to load contato id: ${id}`));
        req.contato = contato;
        next();
    });
};

exports.update = function(req, res) {
    var contato = req.contato;
    contato.nome_contato = req.body.nome_contato;
    contato.comunicacao = req.body.comunicacao;
    contato.fornecedor = req.body.fornecedor;
    contato.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            update_fornecedor(req, res, contato).then(function() {
                res.json(contato);
            });
        }
    });
};

exports.delete = function(req, res) {
    var contato = req.contato;
    contato.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            delete_fornecedor(req, res, contato);
            res.json(contato);
        }
    });
};

function add_fornecedor(req, res, contato) {
    return new Promise(function(resolve, reject) {
        req.params.contatoId = contato._id;
        req.params.fornecedorId = req.body.fornecedor._id;
        fornecedores.update_fornecedor_do_contato(req, res).then(function(data) {
            resolve('success');
        });
    });
}
function update_fornecedor(req, res, contato) {
    req.params.fornecedorId = contato.fornecedor._id;
    req.contato = contato; // todo: fazer o mesmo nas outras funções.
    fornecedores.update_fornecedor_do_contato(req, res);
}
function delete_fornecedor(req, res, contato) {
    req.contato = contato;
    req.params.fornecedorId = req.contato.fornecedor._id;
    fornecedores.delete_fornecedor_do_contato(req, res);
}