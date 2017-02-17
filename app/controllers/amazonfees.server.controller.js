/**
 * Created by Vittorio on 15/02/2017.
 */
let AmazonFee = require('mongoose').model('AmazonFee');

exports.create = function(req, res) {
    let amazonfee = new AmazonFee(req.body);
    amazonfee.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonfee);
        }
    });
};

exports.list = function(req, res) {
    AmazonFee.find().exec(function (err, amazonfees) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonfees);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.amazonfee);
};

exports.findById = function(req, res, next, id) {
    AmazonFee.findById(id).exec(function (err, amazonfee) {
        if(err) return next(err);
        if(!amazonfee) return next(new Error(`Failed to load amazonfee id: ${id}`));
        req.amazonfee = amazonfee;
        next();
    });
};

exports.update = function(req, res) {
   let amazonfee = req.amazonfee;
    amazonfee.nome_fee = req.body.nome_fee;
    amazonfee.tipo_fee = req.body.tipo_fee;
    amazonfee.criterios_size = req.body.criterios_size;
    amazonfee.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonfee);
        }
    });
};

exports.delete = function(req, res) {
    let amazonfee = req.amazonfee;
    amazonfee.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonfee);
        }
    });
};