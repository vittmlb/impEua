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
    despesas: {
        aduaneiras: [],
        internacionais: { // Despesas originadas no exterior.
            compartilhadas: [],
            // compartilhadas: [{ // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
            //     desc: '',
            //     usd: 0,
            //     brl: 0
            // }],
            individualizadas: 0,  // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            totais: 0 // Despesas internacionais totais - Somatório das despesas compartilhadas com as individualizadas
        },
        nacionais: {
            compartilhadas: 0,
            individualizadas: 0
        },
        fba: {
            fulfillment: 0,
            inventory: 0,
            placement: 0
        },
        total: 0
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
            percentual_despesas: 0,
            percentual_taxas: 0
        }
    },
    zeraObj: function() {
        this.fob = 0;
        this.cif = 0;
        this.taxas = {duty: 0, mpf: 0, hmf: 0, total: 0};

        this.totalPeso = 0; // todo: Descobrir para que serve
        this.volume_ocupado = 0; // todo: Descobrir para que serve

        this.despesas.total = 0;
        this.despesas.aduaneiras = [];

        this.despesas.fba.fulfillment = 0;
        this.despesas.fba.inventory = 0;
        this.despesas.fba.placement = 0;

        this.medidas.peso = {contratado: 0, ocupado: 0, ocupado_percentual: 0};
        this.medidas.volume = {contratado: 0, ocupado: 0, ocupado_percentual: 0};

        this.resultados.investimento = 0;
        this.resultados.lucro = 0;
        this.resultados.roi = 0;

        this.resultados.comparacao.percentual_frete = 0;
        this.resultados.comparacao.percentual_fob = 0;
        this.resultados.comparacao.percentual_duties = 0;
        this.resultados.comparacao.percentual_mpf = 0;
        this.resultados.comparacao.percentual_hmf = 0;
        this.resultados.comparacao.percentual_despesas = 0;
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
    totalizaDespesasAduaneiras: function(listaDespesas) {
        this.despesas.aduaneiras = [];
        this.despesas.total = 0;
        let aduaneiras = [];
        let valor = 0;
        listaDespesas.forEach(function (item) {
            if(item.tipo === 'Valor' && item.ativa === true) {
                aduaneiras.push({
                    nome: item.nome,
                    valor: item.valor
                });
                valor += item.valor;
            }
        });
        this.despesas.aduaneiras = aduaneiras;
        this.despesas.total = valor;
    },
    loadEstudoComDadosConfig: function(config) {
        this.frete_maritimo.valor = Number(config.frete_maritimo);
        this.frete_maritimo.seguro = Number(config.seguro_frete_maritimo);
        this.config.comissao_amazon = Number(config.comissao_amazon);

        this.medidas.volume.contratado = Number(config.volume_cntr_20);
        this.config.percentual_comissao_conny = Number(config.percentual_comissao_conny);

        this.config.mpf = Number(config.mpf);
        this.config.hmf = Number(config.hmf);
    },
    _totalizaComparacoes: function() {
        this.resultados.comparacao.percentual_frete = this.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_despesas = this.despesas.total / this.resultados.investimento;
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
    this.despesas = {
        aduaneiras: [],
            internacionais: { // Despesas originadas no exterior.
            compartilhadas: [
                //     { // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                //     desc: '',
                //     usd: 0,
                //     brl: 0
                // }
            ],
                individualizadas: [
                // diluídas no PREÇO DO PRODUTO - Array com as despesas inerentes à cada produto.
                // { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                //     desc: '',
                //     usd: 0,
                //     brl: 0
                // }
            ],
                totais: 0 // Somatório das despesas compartilhadas e individualizadas.
        },
        nacionais: { // Despesas originadas no exterior.
            compartilhadas: 0, // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                individualizadas: 0, // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                totais: 0 // Somatório das despesas compartilhadas e individualizadas.
        },
        fba: {
            fulfillment: 0,
            inventory: 0,
            placement: 0
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
                percentual_despesas: 0,
                percentual_taxas: 0
        },
        precos: {
            custo: 0,
            venda: 0
        }
    };
    this.modulo_amazon = {
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
        this.despesas = {
            aduaneiras: [],
            internacionais: { // Despesas originadas no exterior.
                compartilhadas: [
                    //     { // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                    //     desc: '',
                    //     usd: 0,
                    //     brl: 0
                    // }
                ],
                individualizadas: [
                    // diluídas no PREÇO DO PRODUTO - Array com as despesas inerentes à cada produto.
                    // { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                    //     desc: '',
                    //     usd: 0,
                    //     brl: 0
                    // }
                ],
                totais: 0 // Somatório das despesas compartilhadas e individualizadas.
            },
            nacionais: { // Despesas originadas no exterior.
                compartilhadas: 0, // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                individualizadas: 0, // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                totais: 0 // Somatório das despesas compartilhadas e individualizadas.
            },
            fba: {
                fulfillment: 0,
                inventory: 0,
                placement: 0
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
                percentual_despesas: 0,
                percentual_taxas: 0
            },
            precos: {
                custo: 0,
                venda: 0
            }
        };
        this.modulo_amazon = {
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
    this.calculaDespesasAmazon = function(valor_unitario) {
        this.despesas.fba.fulfillment = (valor_unitario * this.qtd);
    };
    this.totalizaDespesas = function(produto, estudo) {
        this.despesas.total = (this.cif / estudo.cif) * estudo.despesas.total; // Usar CIF ou FOB?
        this.despesas.total += this.despesas.fba.fulfillment;
    };
    this.calculaResultados = function(estudo) {
        this.resultados.investimento = (
            this.cif +
            this.taxas.total +
            this.despesas.total
        );

        // Cálculo do preço de Custo final do produto.
        this.resultados.precos.custo = this.resultados.investimento / this.qtd;

        // Calcula o resultado unitário e total de cada um dos produtos.
        this.resultados.lucro = ((this.resultados.precos.venda * (1 - estudo.config.comissao_amazon)) - this.resultados.precos.custo) * this.qtd;

        // Calcula o roi do produto.
        this.resultados.roi = this.resultados.lucro / this.resultados.investimento;

        // Calcula os percentuais de comparação entre os componentes do preço final do produto;
        this.resultados.comparacao.percentual_frete = this.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_despesas = this.despesas.total / this.resultados.investimento;
        this.resultados.comparacao.percentual_duties = this.taxas.duty / this.resultados.investimento;
        this.resultados.comparacao.percentual_fob = this.cif / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_mpf = this.taxas.mpf / this.resultados.investimento;
        this.resultados.comparacao.percentual_taxas = this.taxas.total / this.resultados.investimento;

    };

}

angular.module('estudos').factory('CompEstudos', ['Estudos', 'Despesas', 'CompAmazon', function (Estudos, Despesas, CompAmazon) {

    let listaDespesas = Despesas.query();

    function calculaDespesasAmazonDoEstudoDoProduto(produto) {
        let valor = CompAmazon.calculo(produto);
        produto.estudo_do_produto.calculaDespesasAmazon(valor);
    }


    return {
        setProdutosDoEstudo: function(listaDeProdutosDoEstudo) {
            produtosDoEstudo = listaDeProdutosDoEstudo;
        },
        zeraDadosEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.zeraObj();
        },
        zeraDadosDoEstudo: function() {
            estudo.zeraObj();
        },
        criaEstudoDoProduto: function(produto) {
            let obj = new EstudoDoProduto();
            obj.custo_unitario = produto.custo_usd;
            return obj;
        },
        calculaMedidasDoEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.calculaMedidasDoProduto(produto, estudo);
        },
        calculaProporcionalidadeDoEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.calculaProporcionalidade(produto, estudo);
        },
        calculaTaxasDoEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.calculaTaxas(produto, estudo);
        },
        calculaDespesasAmazonDoEstudoDoProduto: function(produto) {
            calculaDespesasAmazonDoEstudoDoProduto(produto);
        },
        totalizaDespesasDoEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.totalizaDespesas(produto, estudo);
        },
        criaEstudo: function() {
            return estudo;
        },
        totalizaDespesasAduaneiras: function() {
            estudo.totalizaDespesasAduaneiras(listaDespesas);
        },
        totalizaImpostosDoEstudo: function(produto) {
            estudo.totalizaImpostosEstudo(produto);
        },
        calculaFobEstudoDoProduto: function(produto) {
            produto.estudo_do_produto.calculaFob(estudo.config.percentual_comissao_conny);
        },
        calculaResultadosEstudoDoProduto: function (produto) {
            produto.estudo_do_produto.calculaResultados(estudo);
        },
        calculaResultadosDoEstudo: function(produto) {
            estudo.calculaResultados(produto);
        },
        totalizaDadosBasicosDoEstudo: function(produto, config) {
            estudo.totalizaDadosBasicosDoEstudo(produto, config);
        },
        loadEstudoComDadosConfig: function(config) {
            estudo.loadEstudoComDadosConfig(config);
        }
    }

}]);