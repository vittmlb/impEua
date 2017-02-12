/**
 * Created by Vittorio on 13/08/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FornecedorSchema = new Schema({
    nome_fornecedor: {
        type: String,
        trim: true,
        required: true
    },
    razao_social: {
        type: String,
        trim: true
    },
    email: [{
        type: String,
        trim: true
    }],
    cidade_fornecedor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Cidade'
    },
    _produtoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Produto'
    }],
    _contatoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Contato'
    }]
});

mongoose.model('Fornecedor', FornecedorSchema);