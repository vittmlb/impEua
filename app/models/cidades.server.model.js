/**
 * Created by Vittorio on 14/08/2016.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CidadeSchema = new Schema({
    nome_cidade: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    estado_cidade: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Estado'
    },
    _fornecedorId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor'
    }]
});

mongoose.model('Cidade', CidadeSchema);