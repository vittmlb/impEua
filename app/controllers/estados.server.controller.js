/**
 * Created by Vittorio on 14/08/2016.
 */
var Estados = require('mongoose').model('Estado');
var paises = require('./paises.server.controller');

exports.create = function(req, res) {
    var estado = new Estados(req.body);
    estado.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            add_pais(req, estado).then(function () {
                res.json(estado);
            }).catch(function(err) {
                return res.status(400).send({
                    message: err
                });
            });
        }
    });
};

exports.list = function(req, res) {
    Estados.find().populate('pais_estado').populate('_cidadeId').exec(function (err, estados) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(estados);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.estado);
};

exports.findById = function(req, res, next, id) {
    Estados.findById(id).populate('pais_estado').populate('_cidadeId').exec(function (err, estado) {
        if(err) return next(err);
        if(!estado) return next(new Error(`Failed to load estado id: ${id}`));
        req.estado = estado;
        next();
    });
};

exports.update = function(req, res) {
    var estado = req.estado;
    estado.nome_estado = req.body.nome_estado;
    estado.sigla_estado = req.body.sigla_estado;
    estado.pais_estado = req.body.pais_estado;
    estado.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            var updatePromise = update_pais(req, res);
            updatePromise.then(function () {
                res.json(estado);
            });
            updatePromise.catch(function (err) {
                return res.status(400).send({
                    message: err
                });
            });
        }
    });
};

exports.delete = function(req, res) {
    var estado = req.estado;
    if(_temCidadeAssociado(req)) {
        return res.status(400).send({
            message: 'O Estado não pode ser removido pois ainda há cidades a ele vinculadas.'
        });
    } else {
        estado.remove(function(err) {
            if(err) {
                reject(err);
            } else {
                var deletePromise = delete_pais(req, res);
                deletePromise.then(function () {
                    res.json(estado);
                    resolve(estado);
                });
                deletePromise.catch(function (err) {
                    reject(err);
                });
            }
        });
    }
};


/**
 * Adiciona a _id do estado à lista de ids ( [_estadoId]) de estados no objeto país
 * @param req
 * @param res
 * @param estado
 */
function add_pais(req, estado) {
    return new Promise(function (resolve, reject) {
        req.params.estadoId = estado._id;
        req.params.paisId = estado.pais_estado;
        var updatePromise = paises.update_estado_pais(req);
        updatePromise.then(function (data) {
            resolve(data);
        });
        updatePromise.catch(function (err) {
            reject(err);
        });
    });
}
function update_pais(req) {
    return new Promise(function (resolve, reject) {
        req.params.paisId = req.body.pais_estado._id;
        var updatePromise = paises.update_estado_pais(req);
        updatePromise.then(function (data) {
            resolve(data);
        });
        updatePromise.catch(function (err) {
            reject(err);
        });
    });
}
function delete_pais(req) {
    return new Promise(function (resolve, reject) {
        req.params.paisId = req.estado.pais_estado._id;
        req.params.estadoId = req.estado._id;
        var deletePromise = paises.delete_estado_pais(req);
        deletePromise.then(function (data) {
            resolve(data);
        });
        deletePromise.catch(function (err) {
            reject(err);
        });
    });
}

// Cidades
exports.update_cidade_estado = function(req) {
    _removeCidadeEstadoAntigo(req).then(function() {
        var updatePromise = Estados.findById(req.params.estadoId).exec();
        updatePromise.then(function (estado) {
            estado._cidadeId.push(req.params.cidadeId);
            estado.save();
        });
        updatePromise.catch(function (err) {
            return err;
        });
    });
};
exports.delete_cidade_estado = function(req) {
    _removeCidadeEstadoAntigo(req);
};

/**
 * Remove a objectId de uma cidade da lista de cidades vinculadas a um estado
 * @param req
 * @param res
 * @private
 */
function _removeCidadeEstadoAntigo(req) {
    var cidade_id = req.params.cidadeId;
    var promise = Estados.findOne({_cidadeId: cidade_id}).exec();
    promise.then(function (estado) {
        if(estado){
            if(estado._doc.hasOwnProperty('_cidadeId')) {
                var index = estado._cidadeId.indexOf(cidade_id);
                if(index > -1) {
                    estado._cidadeId.splice(index, 1);
                    estado.save();
                }
            }
        }
    });
    promise.catch(function (err) {
        return err;
    });
    return promise;
}
function _temCidadeAssociado(req) {
    return (req.estado._cidadeId.length);
}