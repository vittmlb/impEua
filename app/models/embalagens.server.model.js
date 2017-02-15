/**
 * Created by Vittorio on 14/02/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let EmbalagemSchema = new Schema({
    nome_embalagem: {
        type: String,
        trim: true,
        required: `O campo 'nome_embalagem' é obrigatório.`
    },
    dimensoes: {
        altura: Number,
        largura: Number,
        comprimento: Number
    },
    volume: {
        type: Number
    },
    modal: {
        type: String,
        enum: ['Aéreo', 'Marítimo']
    }
});

EmbalagemSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

EmbalagemSchema.virtual('virtual.volume_calculado').get(function () {
    return (this.dimensoes.altura * this.dimensoes.largura * this.dimensoes.comprimento);
});

mongoose.model('Embalagem', EmbalagemSchema);