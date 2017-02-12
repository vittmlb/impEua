/**
 * Created by Vittorio on 01/06/2016.
 */
let Despesas = require('mongoose').model('Despesa');

exports.create = function(req, res) {
    let despesa = new Despesas(req.body);
    despesa.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(despesa);
        }
    });
};

exports.list = function(req, res) {
    Despesas.find().exec(function (err, despesas) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(despesas);
        }
    });
};

exports.update = function(req, res) {
    let despesa = req.despesa;
    despesa.nome = req.body.nome;
    despesa.tipo = req.body.tipo;
    despesa.valor = req.body.valor;
    despesa.aliquota = req.body.aliquota;
    despesa.ativa = req.body.ativa;
    despesa.save(function (err, despesa) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(despesa);
        }
    });
};

exports.delete = function(req, res) {
    let despesa = req.despesa;
    despesa.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(despesa);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.despesa);
};

exports.findById = function(req, res, next, id) {
    Despesas.findById(id).exec(function (err, despesa) {
        if(err) return next(err);
        if(!despesa) return next(new Error(`Failed to load despesa: ${id}`));
        req.despesa = despesa;
        next();
    });
};