/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('estudos').factory('Estudos', ['$resource', function ($resource) {
    return $resource('/api/estudos/:estudoId', {
        estudoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

let config = {
    volume_cntr_20: 0,
    frete_maritimo: 0,
    seguro_frete_maritimo: 0,
    comissao_amazon: 0,
    percentual_comissao_conny: 0,
    mpf: 0,
    hmf: 0,
};

let estudo = {
    nome_estudo: '',
    config: {
        volume_cntr_20: 0,
        frete_maritimo: 0,
        seguro_frete_maritimo: 0,
        comissao_amazon: 0,
        percentual_comissao_conny: 0,
        mpf: 0,
        hmf: 0,
    },
    total_comissao_conny: 0, // todo: Implementar comissão Conny
    fob: 0,
    cif: 0,
    frete_maritimo: {
        valor: 0,
        seguro: 0
    },
    medidas: {
        peso: {
            contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
            ocupado: 0,
            ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
        },
        volume: {
            contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
            ocupado: 0,
            ocupado_percentual: 0
        }
    },
    taxas: {
        duty: 0,
        mpf: 0,
        hmf: 0,
        total: 0
    },
    custos: {
        aduaneiras: {
            lista: [],
            total: 0
        },
        internacionais: { // Custos originadas no exterior.
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0,
            },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            total: 0 // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
        },
        nacionais: {
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0
            }
        },
        total: 0
    },
    modulo_amazon: {
        fba: {
            fulfillment: 0,
            inventory: 0,
            placement: 0
        },
        comissoes: 0
    },
    resultados: {
        investimento: 0,
        lucro: 0,
        roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
        comparacao: {
            percentual_frete: 0,
            percentual_fob: 0,
            percentual_duties: 0,
            percentual_mpf: 0,
            percentual_hmf: 0,
            percentual_custos: 0,
            percentual_taxas: 0
        }
    },
    zeraObj: function() {
        this.fob = 0;
        this.cif = 0;
        this.taxas = {duty: 0, mpf: 0, hmf: 0, total: 0};

        this.custos = {aduaneiras: {lista: [], total: 0}, internacionais: { // Custos originadas no exterior.
                compartilhadas: {
                    lista: [],
                    total: 0
                },
                individualizadas: {
                    lista: [],
                    total: 0,
                },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                total: 0 // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
            }, nacionais: {
                compartilhadas: {
                    lista: [],
                    total: 0
                },
                individualizadas: {
                    lista: [],
                    total: 0
                }
            }, total: 0};

        this.modulo_amazon.fba.fulfillment = 0;
        this.modulo_amazon.fba.inventory = 0;
        this.modulo_amazon.fba.placement = 0;
        this.modulo_amazon.comissoes = 0;

        this.medidas.peso.ocupado = 0;
        this.medidas.peso.ocupado_percentual = 0;

        this.medidas.volume.ocupado = 0;
        this.medidas.volume.ocupado_percentual = 0;

        this.resultados.investimento = 0;
        this.resultados.lucro = 0;
        this.resultados.roi = 0;

        this.resultados.comparacao.percentual_frete = 0;
        this.resultados.comparacao.percentual_fob = 0;
        this.resultados.comparacao.percentual_duties = 0;
        this.resultados.comparacao.percentual_mpf = 0;
        this.resultados.comparacao.percentual_hmf = 0;
        this.resultados.comparacao.percentual_custos = 0;
        this.resultados.comparacao.percentual_taxas = 0;
    },

    /**
     * Incrementa os totais dos tributos do estudo "geral" com base nos valores de cada produto passado como argumento.
     * @param produto
     */
    totalizaImpostosEstudo: function(produto) {
        let estProduto = produto.estudo_do_produto;

        // Update (soma) dos valores dos impostos ao Estudo Geral.

        this.taxas.duty += estProduto.taxas.duty;
        this.taxas.mpf += estProduto.taxas.mpf;
        this.taxas.hmf += estProduto.taxas.hmf;
        this.taxas.total += estProduto.taxas.total
    },
    calculaResultados: function(produto) {
        // Região para acumular os dados do Estudo
        this.resultados.investimento += produto.estudo_do_produto.resultados.investimento;
        // Update (soma) dos lucros dos produtos para formar o Lucro Total do Estudo.
        this.resultados.lucro += produto.estudo_do_produto.resultados.lucro;
        this.resultados.roi = estudo.resultados.lucro / estudo.resultados.investimento;
        this._totalizaComparacoes();
    },
    totalizaDadosBasicosDoEstudo: function(produto, config) {

        this.fob = 0;
        this.medidas.peso.ocupado = 0;
        this.medidas.volume.ocupado = 0;
        this.medidas.volume.ocupado_percentual = 0;

        this.fob += ((produto.estudo_do_produto.custo_unitario * produto.estudo_do_produto.qtd) * (1 + config.percentual_comissao_conny)); // Calcula Fob
        this.cif = this.fob + this.frete_maritimo.valor + this.frete_maritimo.seguro;
        this.medidas.peso.ocupado += produto.medidas.peso * produto.estudo_do_produto.qtd; // Calcula peso total
        this.medidas.volume.ocupado += produto.medidas.cbm * produto.estudo_do_produto.qtd; // Calcula volume ocupado no contêiner
        this.medidas.volume.ocupado_percentual = (this.medidas.volume.ocupado / this.medidas.volume.contratado) * 100;
    },
    totalizaCustosAduaneiras: function(listaCustos) {
        let aduaneiras = [];
        let valor = 0;
        listaCustos.forEach(function (item) {
            if(item.tipo === 'Valor' && item.ativa === true) {
                aduaneiras.push({
                    nome: item.nome,
                    valor: item.valor
                });
                valor += item.valor;
            }
        });
        this.custos.aduaneiras.lista = aduaneiras;
        this.custos.aduaneiras.total = valor;
        this.custos.total = valor;
    },
    totalizaCustosDoEstudo: function() {

    },
    setConfig: function(objConfig) {
        this.config = objConfig;
        this._loadEstudoComDadosConfig();
    },
    _loadEstudoComDadosConfig: function() {
        this.frete_maritimo.valor = Number(this.config.frete_maritimo);
        this.frete_maritimo.seguro = Number(this.config.seguro_frete_maritimo);
        this.config.comissao_amazon = Number(this.config.comissao_amazon);

        this.medidas.volume.contratado = Number(this.config.volume_cntr_20);
        this.config.percentual_comissao_conny = Number(this.config.percentual_comissao_conny);

        this.config.mpf = Number(this.config.mpf);
        this.config.hmf = Number(this.config.hmf);
    },
    _totalizaComparacoes: function() {
        this.resultados.comparacao.percentual_frete = this.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_custos = this.custos.total / this.resultados.investimento;
        this.resultados.comparacao.percentual_duties = this.taxas.duty / this.resultados.investimento;
        this.resultados.comparacao.percentual_fob = this.fob / this.resultados.investimento;
        this.resultados.comparacao.percentual_mpf = this.taxas.mpf / this.resultados.investimento;
        this.resultados.comparacao.percentual_taxas = this.taxas.total / this.resultados.investimento;
    },
};

let produtosDoEstudo = [];

function EstudoDoProduto() {
    this.qtd = 0;
    this.proporcionalidade = { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
        fob: 0,
            peso: 0,
    };
    this.custo_unitario = 0; // Não lembro o como funciona isso aqui.
    this.fob = 0;
    this.cif = 0;
    this.frete_maritimo = {
        valor: 0,
        seguro: 0
    };
    this.medidas = {
        peso: {
            contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                ocupado: 0,
                ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
        },
        volume: {
            contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
                ocupado: 0,
                ocupado_percentual: 0
        }
    };
    this.taxas = {
        duty: 0,
        mpf: 0,
        hmf: 0,
        total: 0
    };
    this.custos = {
        aduaneiras: {
            lista: [],
            total: 0
        },
        internacionais: { // Custos originadas no exterior.
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0,
            },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            total: 0 // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
        },
        nacionais: {
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0
            }
        },
        total: 0
    };
    this.resultados = {
        investimento: 0,
            lucro: 0,
            roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
            comparacao: {
            percentual_frete: 0,
                percentual_fob: 0,
                percentual_duties: 0,
                percentual_mpf: 0,
                percentual_hmf: 0,
                percentual_custos: 0,
                percentual_taxas: 0
        },
        precos: {
            custo: 0, // preço de custo final do produto.
            venda: 0, // preço de venda - informado na tabela de produtos do estudo.
            amazon: {
                fba: {
                    fulfillment: 0,
                    inventory: 0,
                    placement: 0
                },
                comissoes: 0
            },
            custo_final_consolidado: 0 // custo final do produto com tudo incluído.
        }
    };
    this.modulo_amazon = {
        fba: {
            fulfillment: 0,
            inventory: 0,
            placement: 0
        },
        comissoes: 0,
        categoria: '',
        inspectedRules: []
    };

    this.zeraObj = function() {
        this.qtd = 0;
        // this.proporcionalidade = { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
        //     fob: 0,
        //     peso: 0,
        // };
        this.custo_unitario = 0; // Não lembro o como funciona isso aqui.
        this.fob = 0;
        this.cif = 0;
        this.frete_maritimo = {valor: 0, seguro: 0};
        this.medidas = {
            peso: {
                contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                ocupado: 0,
                ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
            },
            volume: {
                contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
                ocupado: 0,
                ocupado_percentual: 0
            }
        };
        this.taxas = {
            duty: 0,
            mpf: 0,
            hmf: 0,
            total: 0
        };
        this.custos = {
            aduaneiras: {lista: [], total: 0},
            internacionais: { // Custos originadas no exterior.
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0,
            },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            total: 0 // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
        }, nacionais: {
            compartilhadas: {
                lista: [],
                total: 0
            },
            individualizadas: {
                lista: [],
                total: 0
            }
        }, total: 0};
        this.resultados = {
            investimento: 0,
            lucro: 0,
            roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
            comparacao: {
                percentual_frete: 0,
                percentual_fob: 0,
                percentual_duties: 0,
                percentual_mpf: 0,
                percentual_hmf: 0,
                percentual_custos: 0,
                percentual_taxas: 0
            },
            precos: {
                custo: 0, // preço de custo final do produto.
                venda: 0, // preço de venda - informado na tabela de produtos do estudo.
                amazon: {
                    fba: {
                        fulfillment: 0,
                        inventory: 0,
                        placement: 0
                    },
                    comissoes: 0
                },
                custo_final_consolidado: 0 // custo final do produto com tudo incluído.
            }
        };
        this.modulo_amazon = {
            fba: {
                fulfillment: 0,
                inventory: 0,
                placement: 0
            },
            comissoes: 0,
            categoria: '',
            inspectedRules: []
        };
    };
    this.calculaFob = function(percentual_comissao_conny) {
        if (this.qtd <= 0) {
            this.zeraObj();
        } else {
            this.fob = ((this.custo_unitario * (1 + percentual_comissao_conny)) * this.qtd);
        }
    };
    this.calculaMedidasDoProduto = function(produto, estudo) {
        if(this.qtd <= 0) {
            this.zeraObj();
        }
        else
        {
            // Cálculo das medidas > Peso e Volume totais do produto.
            this.medidas.peso.ocupado = produto.medidas.peso * this.qtd;
            this.medidas.volume.ocupado = produto.medidas.cbm * this.qtd;

            // Cálculo dos percentuais > Peso e Volume proporcionais do produto
            this.medidas.peso.ocupado_percentual = this.medidas.peso.ocupado / estudo.medidas.peso.ocupado;
            this.medidas.volume.ocupado_percentual = this.medidas.volume.ocupado / estudo.medidas.volume.ocupado;
        }
    };
    this.calculaProporcionalidade = function(produto, estudo) {
        this.frete_maritimo.valor = this.medidas.peso.ocupado_percentual * estudo.frete_maritimo.valor; // Cálculo de Frete Marítimo proporcional.
        this.frete_maritimo.seguro = this.medidas.peso.ocupado_percentual * estudo.frete_maritimo.seguro; // Cálculo de SEGURO de Frete Marítimo proporcional.
        this.cif = this.fob + this.frete_maritimo.valor + this.frete_maritimo.seguro; // Cálculo CIFs (que é o mesmo que Valor Aduaneiro).
    };
    this.calculaTaxas = function(produto, estudo) {

        // Cálculo de Taxas e Impostos
        this.taxas.duty = produto.duty * this.fob; // Cálculo Duty Tax

        this.taxas.mpf = estudo.config.mpf * this.fob; // Cálculo MPF

        // O MPF não pode custar menos de 35 dólares ou mais de 485.
        if(this.taxas.mpf < 35) {
            this.taxas.mpf = 35;
        } else if(this.taxas.mpf > 485) {
            this.taxas.mpf = 485;
        }

        this.taxas.hmf = estudo.config.hmf * this.fob; // Cálculo HMF
        this.taxas.total = this.taxas.duty + this.taxas.mpf + this.taxas.hmf; // Totaliza
    };
    this.calculaCustosAmazon = function(valor_unitario) {
        this.modulo_amazon.fba.fulfillment = (valor_unitario * this.qtd);

    };
    this.totalizaCustos = function(produto, estudo) {
        this.custos.total = (this.cif / estudo.cif) * estudo.custos.total; // Usar CIF ou FOB?
        this.custos.total += this.modulo_amazon.fba.fulfillment;
    };
    this.calculaResultados = function(estudo) {
        this.resultados.investimento = (
            this.cif +
            this.taxas.total +
            this.custos.total
        );

        // Cálculo do preço de Custo final do produto.
        this.resultados.precos.custo = this.resultados.investimento / this.qtd;

        // Calcula o resultado unitário e total de cada um dos produtos.
        this.resultados.lucro = ((this.resultados.precos.venda * (1 - estudo.config.comissao_amazon)) - this.resultados.precos.custo) * this.qtd;

        // Calcula o roi do produto.
        this.resultados.roi = this.resultados.lucro / this.resultados.investimento;

        // Calcula os percentuais de comparação entre os componentes do preço final do produto;
        this.resultados.comparacao.percentual_frete = this.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_custos = this.custos.total / this.resultados.investimento;
        this.resultados.comparacao.percentual_duties = this.taxas.duty / this.resultados.investimento;
        this.resultados.comparacao.percentual_fob = this.cif / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_mpf = this.taxas.mpf / this.resultados.investimento;
        this.resultados.comparacao.percentual_taxas = this.taxas.total / this.resultados.investimento;

    };

}

angular.module('estudos').factory('CompEstudos', ['Estudos', 'Custos', 'CompAmazon', function (Estudos, Custos, CompAmazon) {

    let listaCustos = Custos.query();

    function calculaCustosAmazonDoEstudoDoProduto(produto) {
        let valor = CompAmazon.calculo(produto);
        produto.estudo_do_produto.calculaCustosAmazon(valor);
    }


    return {
        setProdutosDoEstudo: function(listaDeProdutosDoEstudo) {
            produtosDoEstudo = listaDeProdutosDoEstudo;
        },
        setConfig: function(objConfig) {
            config = objConfig;
            estudo.config = objConfig;
            estudo._loadEstudoComDadosConfig();
        },

        zeraDadosDoEstudo: function() {
            estudo.zeraObj();
        },
        criaEstudoDoProduto: function(produto) {
            let obj = new EstudoDoProduto();
            obj.custo_unitario = produto.custo_usd;
            return obj;
        },
        criaEstudo: function() {
            return estudo;
        },

        // 1
        setFobProdutos: function() {
            produtosDoEstudo.forEach(function (produto) {
                produto.estudo_do_produto.calculaFob(estudo.config.percentual_comissao_conny);
            });
        },
        // 2
        totalizaDadosBasicosEstudo: function() {
            produtosDoEstudo.forEach(function (produto) {

                if(produto.estudo_do_produto.qtd <= 0) {
                    produto.estudo_do_produto.zeraObj();
                } else {
                    estudo.totalizaDadosBasicosDoEstudo(produto, estudo.config);
                }

            });
        },
        // 3
        totalizaCustosDoEstudo: function() {
            estudo.totalizaCustosAduaneiras(listaCustos);
        },
        // 4
        geraEstudoDeCadaProduto: function() {
            produtosDoEstudo.forEach(function (produto) {
                // Garante que o estudo somente seja realizado caso o produto iterado tenha quantidade maior que zero (problema de divisão por zero)
                if(produto.estudo_do_produto.qtd <= 0) {
                    produto.estudo_do_produto.zeraObj();
                }
                else
                {
                    produto.estudo_do_produto.calculaMedidasDoProduto(produto, estudo);

                    // Cálculos de Proporcionalidade
                    produto.estudo_do_produto.calculaProporcionalidade(produto, estudo);

                    // Cálculos das Taxas: Duty, MPF, HMF e Total.
                    produto.estudo_do_produto.calculaTaxas(produto, estudo);

                    // Cálculo dos custos FBA
                    calculaCustosAmazonDoEstudoDoProduto(produto);

                    // Cálculo do total de custos proporcional do produto.
                    produto.estudo_do_produto.totalizaCustos(produto, estudo);


                    estudo.totalizaImpostosEstudo(produto);

                    // calculaResultadosProduto(produto);
                    produto.estudo_do_produto.calculaResultados(estudo);

                    // Região para acumular os dados do Estudo
                    estudo.calculaResultados(produto);

                }

            });
        },

        totalizaDadosBasicosDoEstudo: function(produto, config) {
            estudo.totalizaDadosBasicosDoEstudo(produto, config);
        },
        loadEstudoComDadosConfig: function(config) {
            estudo.loadEstudoComDadosConfig(config);
        }
    }

}]);