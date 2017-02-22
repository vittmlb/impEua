/**
 * Created by Vittorio on 01/06/2016.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CustosSchema = new Schema({
    nome: {
        type: String,
        trim: true,
        required: 'O campo nome é obrigatório'
    },
    tipo: {
        type: String,
        enum: ['Valor', 'Alíquota']
    },
    valor: {
        type: Number
    },
    aliquota: {
        type: Number
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

CustosSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('Custo', CustosSchema);