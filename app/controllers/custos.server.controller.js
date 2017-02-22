/**
 * Created by Vittorio on 01/06/2016.
 */
let Custos = require('mongoose').model('Custo');

exports.create = function(req, res) {
    let custo = new Custos(req.body);
    custo.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(custo);
        }
    });
};

exports.list = function(req, res) {
    Custos.find().exec(function (err, custos) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(custos);
        }
    });
};

exports.update = function(req, res) {
    let custo = req.custo;
    custo.nome = req.body.nome;
    custo.tipo = req.body.tipo;
    custo.valor = req.body.valor;
    custo.aliquota = req.body.aliquota;
    custo.ativo = req.body.ativo;
    custo.save(function (err, custo) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(custo);
        }
    });
};

exports.delete = function(req, res) {
    let custo = req.custo;
    custo.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(custo);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.custo);
};

exports.findById = function(req, res, next, id) {
    Custos.findById(id).exec(function (err, custo) {
        if(err) return next(err);
        if(!custo) return next(new Error(`Failed to load custo: ${id}`));
        req.custo = custo;
        next();
    });
};