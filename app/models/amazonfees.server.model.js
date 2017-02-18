/**
 * Created by Vittorio on 15/02/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AmazonfeesSchema = new Schema({
    nome_fee: {
        type: String,
        trim: true,
        required: `O campo 'nome_fee' é obrigatório`
    },
    tipo_fee: {
        type: String,
        enum: ['FBA Fulfillment Fees', 'Monthly Inventory Storage Fees', 'Inventory Placement Service Fees'],
        required: `O campo 'tipo_fee' é obrigatório`
    },
    media_fee: {
        type: String,
        enum: ['media', 'non-media']
    },
    rules_fee: {
        vigencia: {
            type: mongoose.Schema.Types.ObjectId, ref: 'AmazonRule'
        },
        intervalo_data: {
            type: mongoose.Schema.Types.ObjectId, ref: 'AmazonRule'
        },
        dimensionamento: {
            type: mongoose.Schema.Types.ObjectId, ref: 'AmazonRule'
        },
        pesagem: {
            type: mongoose.Schema.Types.ObjectId, ref: 'AmazonRule'
        }
    },
    dados_fee: {
        valor: Number
    }
});



mongoose.model('AmazonFee', AmazonfeesSchema);

// criterios_size: {
//     nome_size: {
//         type: String,
//             required: `O campo 'nome_size' é obrigatório`,
//     enum: ['Small stantard-size', 'Large stantard-size', 'Small oversize', 'Medium oversize', 'Large oversize', 'Special oversize' ]
//     },
//     regras: [{
//         tipo_dimensao: {
//             type: String,
//             enum: ['volume', 'medida', 'peso', 'data'],
//         },
//         operador: {
//             type: String,
//             enum: [`igual`, 'maior', 'menor', 'maior ou igual', 'menor ou igual', '>=']
//         },
//         dados: {
//             valor: {
//                 type: Number,
//                 required: `O Campo 'AmazonRegras > Dados > Valor' é obrigatório`
//             },
//             unidade: {
//                 type: String,
//                 enum: ['oz', 'lb', 'polegadas'],
//                 required: `O Campo 'AmazonRegras > Dados > Unidade' é obrigatório`
//             },
//             lados: {
//                 type: String,
//                 enum: ['shortest', 'median', 'longest', 'longest plus girth']
//             }
//         }
//     }]
// }