/**
 * Created by Vittorio on 28/02/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let DespesasSchema = new Schema({
    nome_despesa: {
        type: String,
        trim: true,
        required: `O campo 'nome_despesa' é obrigatório`
    },
    periodicidade: {
        type: String,
        enum: ['Mensal', 'Senamal', 'Diária', 'Trimestral', 'Semestral', 'Anual']
    },
    tipo_despesa: {
        type: String,
        enum: ['Valor', 'Percentual']
    },
    valor_despesa: {
        type: Number,
    },
    percentual_despesa: {
        type: Number
    }
});

DespesasSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('Despesa', DespesasSchema);