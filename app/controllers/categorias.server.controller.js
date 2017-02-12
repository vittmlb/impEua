/**
 * Created by Vittorio on 02/09/2016.
 */
var Categorias = require('mongoose').model('Categoria');

exports.create = function(req, res) {
    var categoria = new Categorias(req.body);
    categoria.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(categoria);
        }
    });
};

exports.list = function(req, res) {
    Categorias.find().exec(function (err, categorias) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(categorias);
        }
    });
};

exports.read = function(req, res) {
    res.json(req.categoria);
};

exports.findById = function(req, res, next, id) {
    Categorias.findById(id).exec(function (err, categoria) {
        if(err) return next(err);
        if(!categoria) return next(new Error(`Failed to load categoria id: ${id}`));
        req.categoria = categoria;
        next();
    });
};

exports.update = function(req, res) {
    var categoria = req.categoria;
    categoria.nome_categoria = req.body.nome_categoria;
    categoria.icon_categoria = req.body.icon_categoria;
    categoria.descricao_categoria = req.body.descricao_categoria;
    categoria.notas_categoria = req.body.notas_categoria;
    categoria.tags = req.body.tags;
    categoria.subcategorias = req.body.subcategorias;
    categoria._produtoId = req.body._produtoId;
    categoria._fornecedorId = req.body._fornecedorId;
    categoria.save(function (err) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(categoria);
        }
    });
};

exports.delete = function(req, res) {
    var categoria = req.categoria;
    var aux = _podeDeletarCategoria(req, res);
    if(aux !== true) {
        return aux;
    }
    categoria.remove(function (err, categoria) {
        if(err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(categoria);
        }
    });

};

function _podeDeletarCategoria(req, res) {
    var categoria = req.categoria;
    if(categoria._produtoId.length > 0) {
        return 'A Categoria não pode ser removida pois ainda há produtos a ela vinculados';
    }
    if(categoria._fornecedorId.length > 0) {
        return 'A Categoria não pode ser removida pois ainda há fornecedores a ela vinculados.'
    }
    return true;
}