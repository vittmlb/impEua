/**
 * Created by Vittorio on 17/02/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AmazonrulesSchema = new Schema({
    nome_set: {
        type: String,
        trim: true,
        required: `O campo 'nome_set' é obrigatório`
    },
    tipo_set: {
        type: String,
        enum: ['Vigência', 'Intervalo Data', 'Dimensionamento', 'Pesagem'],
        required: `O campo 'tipo_set' é obrigatório`
    },
    rule_set: [{
        tipo_rule: {
            type: String,
            enum: ['volume', 'medida', 'peso', 'data'],
        },
        operador_rule: {
            type: String,
            enum: [`igual`, 'maior', 'menor', 'maior ou igual', 'menor ou igual']
        },
        dados_rule: {
            valor: {
                type: Number
            },
            unidade: {
                type: String,
                enum: ['oz', 'lb', 'polegadas', 'metro', 'm3']
            },
            data: {
                type: Date
            }
        },
        params_rule: {
            lados: {
                type: String,
                enum: ['shortest side', 'median side', 'longest side', 'longest plus girth']
            }
        }
    }]
});

mongoose.model('AmazonRule', AmazonrulesSchema);