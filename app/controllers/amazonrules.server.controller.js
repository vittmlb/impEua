/**
 * Created by Vittorio on 17/02/2017.
 */
let AmazonRules = require('mongoose').model('AmazonRule');

exports.create = function(req, res) {
    let amazonRule = new AmazonRules(req.body);
    amazonRule.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonRule);
        }
    });
};

exports.list = function(req, res) {
    AmazonRules.find().exec(function (err, amazonRules) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonRules);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.amazonRule);
};

exports.findById = function(req, res, next, id) {
    AmazonRules.findById(id).exec(function (err, amazonRule) {
        if(err) return next(err);
        if(!amazonRule) return next(new Error(`Failed to load amazonRule id: ${id}`));
        req.amazonRule = amazonRule;
        next();
    });
};

exports.update = function(req, res) {
    let amazonRule = req.amazonRule;
    amazonRule.nome_set = req.body.nome_set;
    amazonRule.tipo_set = req.body.tipo_set;
    amazonRule.rule_set = req.body.rule_set;
    amazonRule.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonRule);
        }
    });
};

exports.delete = function(req, res) {
    let amazonRule = req.amazonRule;
    amazonRule.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(amazonRule);
        }
    });
};