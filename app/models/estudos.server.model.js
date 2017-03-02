/**
 * Created by Vittorio on 15/Number8/2Number16.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ConfigSchema = new Schema({
    volume_cntr_20: {
        type: Number
    },
    frete_maritimo: {
        type: Number
    },
    seguro_frete_maritimo: {
        type: Number
    },
    comissao_amazon: {
        type: Number
    },
    percentual_comissao_conny: {
        type: Number
    },
    mpf: {
        type: Number
    },
    hmf: {
        type: Number
    }
});

let ObjetoEstudoSchema = new Schema({
    nome_estudo: String,
    lista_produtos: [],
    cotacao_dolar: {
        type: Number
    },
    cotacao_dolar_paypal: {
        type: Number
    },
    config: ConfigSchema,
    total_comissao_conny_usd: Number,
    total_comissao_conny_brl: Number,
    fob: {
        declarado: {
            usd: Number,
            brl: Number
        },
        cheio: { // FOB real, como se o processo fosse feito integralmente por dentro (sem paypal)
            usd: Number,
            brl: Number
        }
    },
    cif: {
        declarado: { // CIF que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
            usd: Number,
            brl: Number
        },
        cheio: { // CIF real, como se o processo fosse feito integralmente por dentro (sem paypal)
            usd: Number,
            brl: Number
        }
    },
    frete_maritimo: {
        valor: {
            usd: Number,
            brl: Number
        },
        seguro: {
            usd: Number,
            brl: Number
        }
    },
    medidas: {
        peso: {
            contratado: Number, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
            ocupado: Number,
            ocupado_percentual: Number // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
        },
        volume: {
            contratado: Number, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
            ocupado: Number,
            ocupado_percentual: Number
        }
    },
    aliq_icms: Number,
    tributos: {
        declarado: { // Tributos que constarão da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
            ii: {
                usd: Number,
                brl: Number
            },
            ipi: {
                usd: Number,
                brl: Number
            },
            pis: {
                usd: Number,
                brl: Number
            },
            cofins: {
                usd: Number,
                brl: Number
            },
            icms: {
                usd: Number,
                brl: Number
            },
            total: {
                usd: Number,
                brl: Number
            }
        },
        cheio: { // Tributaçao real, como se o processo fosse feito integralmente por dentro (sem paypal). Seria o total de impostos a pagar se não houvesse sonegação
            ii: {
                usd: Number,
                brl: Number
            },
            ipi: {
                usd: Number,
                brl: Number
            },
            pis: {
                usd: Number,
                brl: Number
            },
            cofins: {
                usd: Number,
                brl: Number
            },
            icms: {
                usd: Number,
                brl: Number
            },
            total: {
                usd: Number,
                brl: Number
            }
        }
    },
    despesas: {
        afrmm: {
            usd: Number,
            brl: Number
        }, // todo: Não tem qualquer utilidade. Serve apenas para comparar se os cálculos estão corretos. Encontrar nova forma de fazer isso e elimitar isso daqui.
        aduaneiras: {
            usd: Number,
            brl: Number
        },
        internacionais: { // Despesas originadas no exterior.
            compartilhadas: [{ // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                desc: String,
                usd: Number,
                brl: Number
            }],
            individualizadas: { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                usd: Number,
                brl: Number
            },
            totais: { // Despesas internacionais totais - Somatório das custos compartilhadas com as individualizadas
                usd: Number,
                brl: Number,
            }
        },
        nacionais: {
            compartilhadas: {
                usd: Number,
                brl: Number
            },
            individualizadas: {
                usd: Number,
                brl: Number
            }
        },
        total: {
            usd: Number,
            brl: Number
        }
    },
    resultados: {
        investimento: {
            declarado: { // Investimento que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                usd: Number,
                brl: Number
            },
            paypal: { // Investimento feito através do paypal
                usd: Number,
                brl: Number,
                taxa_iof: { // Montante pago em IOF > não é a alíquota.
                    usd: Number,
                    brl: Number,
                },
                taxa_paypal: { // Montante pago em IOF > não é a alíquota.
                    usd: Number,
                    brl: Number,
                },
                taxa_conny: { // Montante pago em IOF > não é a alíquota.
                    usd: Number,
                    brl: Number,
                }
            },
            final: { // Montante EFETIVAMENTE desembolsado para a aquisiçao do produto > declarado + paypal
                brl: Number
            },
            cheio: { // Montante que teria sido investido se o processo fosse feito integralmente por dentro (sem paypal)
                brl: Number
            }
        },
        lucro: {
            final: { // Lucro real obtido na operação, contemplando os gastos declarados e o total enviado através do paypal
                usd: Number,
                brl: Number
            }
        },
        roi: { // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
            brl: Number
        }
    },
});

let EstudoDoProduto = new Schema({
    qtd: Number,
    preco_venda: Number,
    venda_media: {
        diaria: {
            unidades: Number
        }
    },
});

let EstudoSchema = new Schema({
    criadoEm: {
        type: Date,
        default: Date.now
    },
    ultima_atualizacao: {
        type: Date,
        default: Date.now
    },
    nome_estudo: {
        type: String,
        trim: true,
        default: 'Caralho ' + Date.now
        // unique: true,
        // required: 'O Campo nome_estudo é obrigatório'
    },
    produtosDoEstudo: [
        {
            produto_ref: {
                type: mongoose.Schema.Types.ObjectId, ref: 'Produto',
            },
            estudo_do_produto: EstudoDoProduto
        }
    ],
    config: ConfigSchema
});

mongoose.model('Estudo', EstudoSchema);