/**
 * Created by Vittorio on 14/02/2017.
 */
let Embalagens = require('mongoose').model('Embalagem');

exports.create = function(req, res) {
    let embalagem = new Embalagens(req.body);
    embalagem.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(embalagem);
        }
    });
};

exports.list = function(req, res) {
    Embalagens.find().exec(function (err, embalagens) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(embalagens);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.embalagem);
};

exports.findById = function(req, res, next, id) {
    Embalagens.findById(id).exec(function (err, embalagem) {
        if(err) return next(err);
        if(!embalagem) return next(new Error(`Failed to load embalagem id: ${id}`));
        req.embalagem = embalagem;
        next();
    });
};

exports.update = function(req, res) {
    let embalagem = req.embalagem;
    embalagem.nome_embalagem = req.body.nome_embalagem;
    if (req.body.modal === 'Aéreo') {
        embalagem.dimensoes = {'altura': '', 'largura': '', 'comprimento': ''};
        embalagem.volume = '';
    } else {
        embalagem.dimensoes = req.body.dimensoes;
        embalagem.volume = req.body.volume;
    }
    embalagem.modal = req.body.modal;
    embalagem.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(embalagem);
        }
    });
};

exports.delete = function(req, res) {
    let embalagem = req.embalagem;
    embalagem.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(embalagem);
        }
    });
};