/**
 * Created by Vittorio on 13/08/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaisSchema = new Schema({
    nome_pais: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    sigla_pais: {
        type: String,
        trim: true
    },
    nome_pais_en: {
        type: String,
        trim: true,
        required: true,
    },
    _estadoId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Estado'
    }],
    // _cidadeId: [{
    //     type: mongoose.Schema.Types.ObjectId, ref: 'Cidade'
    // }]
});

PaisSchema.virtual('flag_url').get(function (size) {
    return `/uploads/flags/64/${this.nome_pais_en}.png`;
});

PaisSchema.set('toJSON', {
    virtuals: true
});

mongoose.model('Pais', PaisSchema);