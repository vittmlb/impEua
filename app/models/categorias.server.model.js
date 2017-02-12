/**
 * Created by Vittorio on 02/09/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriasSchema = new Schema({
    nome_categoria: {
        type: String,
        trim: true,
        required: true //todo: Adicionar um unique aqui depois.
    },
    icon_categoria: {
        type: String,
        trim: true
    },
    descricao_categoria: {
        type: String,
        trim: true,
    },
    notas_categoria: {
        type: String
    },
    tags: [{
        type: String,
        trim: true
    }],
    subcategorias: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Categoria'
    }],
    _produtoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Produto'
    }],
    _fornecedorId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor'
    }]
});

mongoose.model('Categoria', CategoriasSchema);