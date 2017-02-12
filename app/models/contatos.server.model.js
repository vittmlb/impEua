/**
 * Created by Vittorio on 31/08/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TempTipoComunicacaoSchema = new Schema({
    tipo: {
        type: String,
        enum: ['email', 'skype', 'msn', 'facebook', 'twitter', 'whatsapp'],
        default: 'email'
    }
});

var TipoComunicacaoSchema = new Schema({
    tipo: {
        type: String,
        enum: ['email', 'skype', 'msn', 'facebook', 'twitter', 'whatsapp'],
        default: 'email'
    },
    info: {
        type: String,
        trim: true
    }
});

var ContatosSchema = new Schema({
    criadoEm: {
        type: Date,
        default: Date.now
    },
    nome_contato: {
        type: String,
        trim: true,
        required: true
    },
    comunicacao: [{
        tipo: {
            type: String,
            enum: ['email', 'skype', 'msn', 'facebook', 'twitter', 'whatsapp'],
            default: 'email'
        },
        info: {
            type: String,
            trim: true
        }
    }],
    fornecedor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor'
    }
});

mongoose.model('TipoComunicacao', TipoComunicacaoSchema);
mongoose.model('Contato', ContatosSchema);