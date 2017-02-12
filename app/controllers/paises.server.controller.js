/**
 * Created by Vittorio on 13/08/2016.
 */
var Paises = require('mongoose').model('Pais');

exports.create = function(req, res) {
    var pais = new Paises(req.body);
    pais.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(pais);
        }
    });
};

exports.list = function(req, res) {
    Paises.find().populate('_estadoId').exec(function (err, paises) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(paises);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.pais);
};

exports.findById = function(req, res, next, id) {
    Paises.findById(id).populate({
        path: '_estadoId',
        populate: {path: '_cidadeId', populate: {path: '_fornecedorId'}}
    }).exec(function (err, pais) {
        if(err) return next(err);
        if(!pais) return next(new Error(`Failed to load pais id: ${id}`));
        req.pais = pais;
        next();
    });
};

exports.update = function(req, res) {
    var pais = req.pais;
    pais.nome_pais = req.body.nome_pais;
    pais.sigla_pais = req.body.sigla_pais;
    pais.nome_pais_en = req.body.nome_pais_en;
    pais.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(pais);
        }
    });
};

exports.delete = function(req, res) {
    var pais = req.pais;
    if(_temEstadoAssociado(req)) {
        return res.status(400).send({
            message: 'O País não pode ser removido pois ainda há estados a ele vinculados'
        });
    }
    pais.remove(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(pais);
        }
    });
};

exports.update_estado_paisOld = function(req) {
    _removeEstadoPaisAntigo(req);
    var updatePromise = Paises.findById(req.params.paisId).exec();
    updatePromise.then(function (pais) {
        pais._estadoId.push(req.params.estadoId);
        pais.save();
    });
    updatePromise.then(function (err) {
        return err;
    });
    return updatePromise;
};
exports.update_estado_pais = function(req) {
    _removeEstadoPaisAntigo(req).then(function () {
        var updatePromise = Paises.findById(req.params.paisId).exec();
        updatePromise.then(function (pais) {
            pais._estadoId.push(req.params.estadoId);
            pais.save();
        });
        updatePromise.then(function (err) {
            return err;
        });
        return updatePromise;
    }).catch(function(err) {
        return Promise.reject(err);
    });
};

exports.delete_estado_pais = function(req) {
    return _removeEstadoPaisAntigo(req);
};

/**
 * Remove a objectId de um estado da lista de estados vinculados a um país
 * @param req
 * @param res
 * @private
 */
function _removeEstadoPaisAntigo(req) {
    // var estado_id = req.params.estadoId;
    var promise = Paises.findOne({_estadoId: estado_id}).exec();
    promise.then(function (pais) {
        if(pais){
            if(pais._doc.hasOwnProperty('_estadoId')) {
                var index = pais._estadoId.indexOf(estado_id);
                if(index > -1) {
                    pais._estadoId.splice(index, 1);
                    pais.save();
                }
            }
        }
    });
    promise.catch(function (err) {
        return err;
    });
    return promise;
}
function _temEstadoAssociado(req) {
    return (req.pais._estadoId.length);
}