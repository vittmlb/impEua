/**
 * Created by Vittorio on 14/08/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EstadoSchema = new Schema({
    nome_estado: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    sigla_estado: {
        type: String,
        trim: true,
        unique: true
    },
    pais_estado: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Pais'
    },
    _cidadeId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Cidade'
    }]
});

mongoose.model('Estado', EstadoSchema);