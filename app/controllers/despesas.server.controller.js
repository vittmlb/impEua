/**
 * Created by Vittorio on 28/02/2017.
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

exports.read = function(req, res) {
    res.json(req.despesa);
};

exports.findById = function(req, res, next, id) {
    Despesas.findById(id).exec(function (err, despesa) {
        if(err) return next(err);
        if(!despesa) return next(new Error(`Failed to load despesa id: ${id}`));
        req.despesa = despesa;
        next();
    });
};

exports.update = function(req, res) {
    let despesa = req.despesa;
    despesa.nome_despesa = req.body.nome_despesa;
    despesa.periodicidade = req.body.periodicidade;
    despesa.tipo_despesa = req.body.tipo_despesa;
    despesa.valor_despesa = req.body.valor_despesa;
    despesa.percentual_despesa = req.body.percentual_despesa;
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