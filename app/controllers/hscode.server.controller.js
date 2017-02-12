/**
 * Created by Vittorio on 04/08/2016.
 */

let HsCodes = require('mongoose').model('HS');

exports.create = function(req, res) {
    let hs = new HsCodes(req.body);
    hs.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(hs);
        }
    });
};

exports.list = function(req, res) {
    HsCodes.find().populate('_produtoId').exec(function (err, hscodes) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(hscodes);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.hs);
};

exports.findById = function(req, res, next, id) {
    HsCodes.findById(id).populate('_produtoId').exec(function (err, hs) {
        if(err) return next(err);
        if(!hs) return next(new Error(`Failed to load ncm id: ${id}`));
        req.hs = hs;
        next();
    });
};

exports.update = function(req, res) {
    let hs = req.hs;
    hs.cod_hs = req.body.cod_hs;
    hs.descricao = req.body.descricao;
    hs.li = req.body.li;
    hs.duty = req.body.duty;
    hs.obs = req.body.obs;
    hs.save(function (err) {
        if(err) {
            return req.status(400).send({
                message: err
            });
        } else {
            res.json(hs);
        }
    });
};

exports.delete = function(req, res) {
    let hs = req.hs;
    if(_temProdutoAssociado(req)){
        return res.status(400).send({
            message: 'O NCM não pode ser excluído pois ainda há produtos a ele vinculados'
        });
    }
    hs.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(hs);
        }
    });
};

exports.update_hs_produto = function(req, res) {
    _removeProdutoNcmAntigo(req, res);
    HsCodes.findById(req.params.hsId).exec(function (err, hs) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            hs._produtoId.push(req.params.produtoId);
            hs.save(); // todo: Fazer callback.
        }
    });
};
exports.delete_hs_produto = function(req, res) {
    HsCodes.findById(req.params.hsId).exec(function (err, hs) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            let index = hs._produtoId.indexOf(req.params.produtoId);
            if(index > -1) {
                hs._produtoId.splice(index, 1);
            }
            hs.save();
        }
    });
};

function _removeProdutoNcmAntigo(req, res) {
    let produto_id = req.params.produtoId;
    HsCodes.findOne({_produtoId: req.params.produtoId}).exec(function (err, hs) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            if(hs){
                if(hs._doc.hasOwnProperty('_produtoId')) {
                    let index = hs._produtoId.indexOf(produto_id);
                    if(index > -1) {
                        hs._produtoId.splice(index, 1);
                        hs.save();
                    }
                }
            }
        }
    });
}

function _temProdutoAssociado(req) {
    return (req.hs._produtoId.length);
}