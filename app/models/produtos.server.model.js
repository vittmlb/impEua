/**
 * Created by Vittorio on 30/05/2016.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ProdutoSchema = new Schema({
    nome: {
        type: String,
        default: '',
        trim: true
    },
    modelo: {
        type: String,
        default: '',
        trim: true
    },
    descricao: {
        type: String,
        default: '',
        trim: true
    },
    custo_usd: {
        type: Number,
        default: 0
    },
    moq: {
        type: Number
    },
    hs: {
      type: mongoose.Schema.Types.ObjectId, ref: 'HS'
    },
    usa_duty_hs: {
        type: Boolean,
        default: true
    },
    duty: {
        type: Number
    },
    medidas: {
        cbm: Number,
        peso: Number
    },
    website: {
        type: String,
        default: '',
        trim: true
    },
    notas: {
        type: String,
        default: ''
    },
    img_url: {
        type: String,
        default: '/uploads/images/no-thumb.png'
    },
    fornecedor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor'
    },
    _estudoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Estudo'
    }]
});

ProdutoSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('Produto', ProdutoSchema);

