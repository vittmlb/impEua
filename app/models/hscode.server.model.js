/**
 * Created by Vittorio on 04/08/2016.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HsSchema = new Schema({
    cod_hs: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    descricao: {
        type: String,
        trim: true,
        default: ''
    },
    li: {
        type: Boolean
    },
    duty: {
        type: Number,
        required: true
    },
    obs: {
        type: String
    },
    _produtoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Produto'
    }]
});

HsSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

HsSchema.virtual('cod_com_descricao').get(function () {
    return this.cod_hs + ' - ' + this.descricao;
});

mongoose.model('HS', HsSchema);