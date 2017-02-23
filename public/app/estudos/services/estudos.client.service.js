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

let parametros = {
    volume_cntr_20: 0,
    frete_maritimo: 0,
    seguro_frete_maritimo: 0,
    comissao_amazon: 0,
    percentual_comissao_conny: 0,
    mpf: 0,
    hmf: 0,
};

let estudo = {
    parent: this,
    nome_estudo: '',
    parametros: {
        volume_cntr_20: 0,
        frete_maritimo: 0,
        seguro_frete_maritimo: 0,
        comissao_amazon: 0,
        percentual_comissao_conny: 0,
        mpf: 0,
        hmf: 0,
    },
    fob: 0,
    cif: 0,
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
    custos: {
        comissao_conny: {
            total: 0
        }, // todo: Implementar comissão Conny
        aduaneiros: {
            lista: [],
            total: 0
        },
        internacionais: { // Custos originadas no exterior.
            compartilhados: {
                lista: [],
                total: 0
            },
            individualizados: {
                lista: [],
                total: 0,
            },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            total: 0 // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
        },
        nacionais: {
            compartilhados: {
                lista: [],
                total: 0
            },
            individualizados: {
                lista: [],
                total: 0
            },
            total: 0
        },
        frete_maritimo: {
            valor: 0,
            seguro: 0,
            total: function() {
                return this.valor + this.seguro;
            }
        },
        taxas: {
            duty: 0,
            mpf: 0,
            hmf: 0,
            total: 0
        },
        total: 0
    },
    despesas: {},
    modulos: {
        amazon: {
            fba: {
                fulfillment: 0,
                inventory: 0,
                placement: 0
            },
            comissoes: 0
        }
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

    zera: {
        obj: function() {
            this._custos();
            this._modulos.amazon();
        },
        _custos: function() {

            parent.custos.comissao_conny.total = 0;

            parent.custos.aduaneiros.lista = [];
            this.custos.aduaneiros.total = 0;

            this.custos.internacionais.compartilhados.lista = [];
            this.custos.internacionais.compartilhados.total = 0;
            this.custos.internacionais.individualizados.lista = [];
            this.custos.internacionais.individualizados.total = 0;
            this.custos.internacionais.total = 0;

            this.custos.nacionais.compartilhados.lista = [];
            this.custos.nacionais.compartilhados.total = 0;
            this.custos.nacionais.individualizados.lista = [];
            this.custos.nacionais.individualizados.total = 0;
            this.custos.nacionais.total = 0;

            this.custos.taxas.duty = 0;
            this.custos.taxas.mpf = 0;
            this.custos.taxas.hmf = 0;
            this.custos.taxas.total = 0;
        },
        _modulos: {
            amazon: function() {
                this.modulos.amazon.fba.fulfillment = 0;
                this.modulos.amazon.fba.inventory = 0;
                this.modulos.amazon.fba.placement = 0;
                this.modulos.amazon.comissoes = 0;
            }
        }
    },

    /**
     * Incrementa os totais dos tributos do estudo "geral" com base nos valores de cada produto passado como argumento.
     * @param produto
     */
    totaliza_custos_taxas: function(produto) {
        let estProduto = produto.estudo_do_produto;

        // Update (soma) dos valores dos impostos ao Estudo Geral.
        this.custos.taxas.duty += estProduto.custos.taxas.duty;
        this.custos.taxas.mpf += estProduto.custos.taxas.mpf;
        this.custos.taxas.hmf += estProduto.custos.taxas.hmf;
        this.custos.taxas.total += estProduto.custos.taxas.total;

    },
    calculaResultados: function(produto) {
        // Região para acumular os dados do Estudo
        this.resultados.investimento += produto.estudo_do_produto.resultados.investimento;
        // Update (soma) dos lucros dos produtos para formar o Lucro Total do Estudo.
        this.resultados.lucro += produto.estudo_do_produto.resultados.lucro;
        this.resultados.roi = estudo.resultados.lucro / estudo.resultados.investimento;
        this._totalizaComparacoes();
    },
    totalizaDadosBasicosDoEstudo: function(produto, ObjParametros) {

        this.fob = 0;
        this.medidas.peso.ocupado = 0;
        this.medidas.volume.ocupado = 0;
        this.medidas.volume.ocupado_percentual = 0;

        this.fob += ((produto.estudo_do_produto.custo_unitario * produto.estudo_do_produto.qtd) * (1 + ObjParametros.percentual_comissao_conny)); // Calcula Fob
        this.cif = this.fob + this.custos.frete_maritimo.total();
        this.medidas.peso.ocupado += produto.medidas.peso * produto.estudo_do_produto.qtd; // Calcula peso total
        this.medidas.volume.ocupado += produto.medidas.cbm * produto.estudo_do_produto.qtd; // Calcula volume ocupado no contêiner
        this.medidas.volume.ocupado_percentual = (this.medidas.volume.ocupado / this.medidas.volume.contratado) * 100;
    },
    totalizaCustosAduaneiros: function(listaCustos) {
        let aduaneiros = [];
        let valor = 0;
        listaCustos.forEach(function (item) {
            if(item.tipo === 'Valor' && item.ativa === true) {
                aduaneiros.push({
                    nome: item.nome,
                    valor: item.valor
                });
                valor += item.valor;
            }
        });
        this.custos.aduaneiros.lista = aduaneiros;
        this.custos.aduaneiros.total = valor;
        this.custos.total = valor;
    },
    totalizaCustosDoEstudo: function() {

    },
    setParametros: function(objParametros) {
        this.parametros = objParametros;
        this._loadParametrosDoEstudo();
    },
    _loadParametrosDoEstudo: function() {
        this.custos.frete_maritimo.valor = Number(this.parametros.frete_maritimo);
        this.custos.frete_maritimo.seguro = Number(this.parametros.seguro_frete_maritimo);
        this.parametros.comissao_amazon = Number(this.parametros.comissao_amazon);

        this.medidas.volume.contratado = Number(this.parametros.volume_cntr_20);
        this.parametros.percentual_comissao_conny = Number(this.parametros.percentual_comissao_conny);

        this.parametros.mpf = Number(this.parametros.mpf);
        this.parametros.hmf = Number(this.parametros.hmf);
    },
    _totalizaComparacoes: function() {
        this.resultados.comparacao.percentual_frete = this.custos.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.custos.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_custos = this.custos.aduaneiros.total / this.resultados.investimento;
        this.resultados.comparacao.percentual_duties = this.custos.taxas.duty / this.resultados.investimento;
        this.resultados.comparacao.percentual_fob = this.fob / this.resultados.investimento;
        this.resultados.comparacao.percentual_mpf = this.custos.taxas.mpf / this.resultados.investimento;
        this.resultados.comparacao.percentual_taxas = this.custos.taxas.total / this.resultados.investimento;
    },
};

let produtosDoEstudo = [];

function EstudoDoProduto() {
    let parent = this;
    this.produto = {};
    this.estudo = {};
    this.qtd = 0;
    this.parametros = {
        volume_cntr_20: 0,
        frete_maritimo: 0,
        seguro_frete_maritimo: 0,
        comissao_amazon: 0,
        percentual_comissao_conny: 0,
        mpf: 0,
        hmf: 0,
    };
    this.custo_unitario = this.produto.custo_usd; // Não lembro o como funciona isso aqui.
    this.fob = 0;
    this.cif = 0;
    this.medidas = {
        peso: {
            contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
            ocupado: function() {
                return parent.produto.medidas.peso * parent.qtd;
            },
            ocupado_percentual: function() {
                if(parent.qtd) {
                    return this.ocupado() / parent.estudo.medidas.peso.ocupado;
                }
                return 0;
            } // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
        },
        volume: {
            contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
            ocupado: function() {
                return parent.produto.medidas.cbm * parent.qtd;
            },
            ocupado_percentual: function() {
                if(parent.qtd) {
                    return this.ocupado() / parent.estudo.medidas.volume.ocupado;
                }
                return 0;
            }
        },
        proporcionalidade: { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
            fob: 0,
            peso: 0,
        }
    };
    this.custos = {
        comissao_conny: {
            total: 0,
            total_calculado: function() {
                return (parent.qtd * parent.custo_unitario * parent.parametros.percentual_comissao_conny);
            }
        },
        aduaneiros: {
            lista: [],
            total: 0
        },
        internacionais: { // Custos originadas no exterior.
            compartilhados: {
                lista: [],
                total_unitario: function() {
                    return parent._calcula_valor_unitario(this.total)
                },
                total: 0
            },
            individualizados: {
                lista: [],
                total_unitario: function(qtd) {
                    return _calcula_valor_unitario(this.total, qtd)
                },
                total: 0,
            },  // Custos internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
            total: 0, // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
            total_calculado: function() {
                return this.compartilhados.total + this.individualizados.total;
            }
        },
        nacionais: {
            compartilhados: {
                lista: [],
                total: 0
            },
            individualizados: {
                lista: [],
                total: 0
            },
            total: 0,
            total_calculado: function() {
                return this.compartilhados.total + this.individualizados.total;
            }
        },
        frete_maritimo: {
            valor: 0,
            seguro: 0,
            total: 0,
            total_calculado: function() {
                return this.valor + this.seguro;
            }
        },
        taxas: {
            duty: 0,
            mpf: 0,
            hmf: 0,
            total: 0,
            total_calculado: function() {
                return this.duty + this.mpf + this.hmf;
            }
        },
        total: 0,
        total_calculado: function() {
            let tot = this.comissao_conny.total_calculado() + this.aduaneiros.total + this.internacionais.total_calculado() + this.nacionais.total_calculado() + this.frete_maritimo.total_calculado() + this.taxas.total_calculado();
            return tot;
        }
    };
    this.despesas = {};
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
    this.modulos = {
        amazon: {
            fba: {
                fulfillment: 0,
                inventory: 0,
                placement: 0
            },
            comissoes: 0,
            categoria: '',
            inspectedRules: []
        }
    };

    this.set = {
        parametros: function(parametros) {
            parent.parametros = parametros;
        },
        estudo: function(estudo) {
            parent.estudo = estudo;
        },
        produto: function(produto) {
            parent.produto = produto;
        },
        medidas: function(produto, estudo) {
            if(parent.qtd) {
                parent.zeraObj();
            } else {
                // parent.medidas.peso.ocupado = produto.medidas.peso * parent.qtd;
                parent.medidas.volume.ocupado = produto.medidas.cbm * parent.qtd;

                // Cálculo dos percentuais > Peso e Volume proporcionais do produto
                parent.medidas.peso.ocupado_percentual = parent.medidas.peso.ocupado / estudo.medidas.peso.ocupado;
                parent.medidas.volume.ocupado_percentual = this.parent.volume.ocupado / estudo.medidas.volume.ocupado;
            }
        },
        custo_unitario: function(custo_unitario) {
            parametros.custo_unitario = custo_unitario;
        }
    };

    this.fob_calculado = function() {
        if (this.qtd <= 0) {
            this.zeraObj();
        } else {
            this.fob = ((this.custo_unitario * (1 + this.parametros.percentual_comissao_conny)) * this.qtd);
            return this.fob;
        }
    };

    this._calcula_valor_unitario = function(valor) {
        if(this.qtd) {
            return valor / this.qtd;
        }
        return 0;
    };


    this.zeraObj = function() {
        this.qtd = 0;
        this.custo_unitario = 0; // Não lembro o como funciona isso aqui.
        this.fob = 0;
        this.cif = 0;
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

        this.custos.aduaneiros.lista = [];
        this.custos.aduaneiros.total = 0;

        this.custos.internacionais.compartilhados.lista = [];
        this.custos.internacionais.compartilhados.total = 0;
        this.custos.internacionais.individualizados.lista = [];
        this.custos.internacionais.individualizados.total = 0;
        this.custos.internacionais.total = 0;

        this.custos.nacionais.compartilhados.lista = [];
        this.custos.nacionais.compartilhados.total = 0;
        this.custos.nacionais.individualizados.lista = [];
        this.custos.nacionais.individualizados.total = 0;
        this.custos.nacionais.total = 0;

        this.custos.taxas.duty = 0;
        this.custos.taxas.mpf = 0;
        this.custos.taxas.hmf = 0;

        this.despesas = {};
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

        this.modulos.amazon.fba.fulfillment = 0;
        this.modulos.amazon.fba.inventory = 0;
        this.modulos.amazon.fba.placement = 0;
        this.modulos.amazon.comissoes = 0;

        this.modulos.amazon.categoria = '';
        this.modulos.amazon.inspectedRules = [];

    };

    // this.calculaMedidasDoProduto = function(produto, estudo) {
    //     if(this.qtd <= 0) {
    //         this.zeraObj();
    //     }
    //     else
    //     {
    //         // Cálculo das medidas > Peso e Volume totais do produto.
    //         this.medidas.peso.ocupado = produto.medidas.peso * this.qtd;
    //         this.medidas.volume.ocupado = produto.medidas.cbm * this.qtd;
    //
    //         // Cálculo dos percentuais > Peso e Volume proporcionais do produto
    //         this.medidas.peso.ocupado_percentual = this.medidas.peso.ocupado / estudo.medidas.peso.ocupado;
    //         this.medidas.volume.ocupado_percentual = this.medidas.volume.ocupado / estudo.medidas.volume.ocupado;
    //     }
    // };
    this.calculaProporcionalidade = function() {
        this.custos.frete_maritimo.valor = this.medidas.peso.ocupado_percentual() * this.parametros.frete_maritimo; // Cálculo de Frete Marítimo proporcional.
        this.custos.frete_maritimo.seguro = this.medidas.peso.ocupado_percentual() * this.parametros.seguro_frete_maritimo; // Cálculo de SEGURO de Frete Marítimo proporcional.
        // this.custos.frete_maritimo.total = this.medidas.peso.ocupado_percentual * estudo.custos.frete_maritimo.total;
        this.cif = this.fob_calculado() + this.custos.frete_maritimo.total_calculado(); // Cálculo CIFs (que é o mesmo que Valor Aduaneiro). todo: Pq o cálculo do CIF está aqui?
    };
    this.calculaTaxas = function(produto, estudo) {

        // Cálculo de Taxas e Impostos
        this.custos.taxas.duty = produto.duty * this.fob_calculado(); // Cálculo Duty Tax

        this.custos.taxas.mpf = estudo.parametros.mpf * this.fob_calculado(); // Cálculo MPF

        // O MPF não pode custar menos de 35 dólares ou mais de 485.
        if(this.custos.taxas.mpf < 35) {
            this.custos.taxas.mpf = 35;
        } else if(this.custos.taxas.mpf > 485) {
            this.custos.taxas.mpf = 485;
        }

        this.custos.taxas.hmf = estudo.parametros.hmf * this.fob_calculado(); // Cálculo HMF

    };
    this.calculaCustosAmazon = function(valor_unitario) {
        this.modulos.amazon.fba.fulfillment = (valor_unitario * this.qtd);
    };
    this.totalizaCustos = function(produto, estudo) {
        this.custos.aduaneiros.total = (this.fob_calculado() / estudo.fob) * estudo.custos.aduaneiros.total; // Usar CIF ou FOB?
        this.custos.aduaneiros.total += this.modulos.amazon.fba.fulfillment;
    };
    this.calculaResultados = function(estudo) {

        this.resultados.investimento = (
            this.fob_calculado() +
            this.custos.total_calculado()
        );

        // Cálculo do preço de Custo final do produto.
        this.resultados.precos.custo = this.resultados.investimento / this.qtd;

        // Calcula o resultado unitário e total de cada um dos produtos.
        this.resultados.lucro = ((this.resultados.precos.venda * (1 - estudo.parametros.comissao_amazon)) - this.resultados.precos.custo) * this.qtd;

        // Calcula o roi do produto.
        this.resultados.roi = this.resultados.lucro / this.resultados.investimento;

        // Calcula os percentuais de comparação entre os componentes do preço final do produto;
        this.resultados.comparacao.percentual_frete = this.custos.frete_maritimo.valor / this.resultados.investimento;
        this.resultados.comparacao.percentual_custos = this.custos.aduaneiros.total / this.resultados.investimento;
        this.resultados.comparacao.percentual_duties = this.custos.taxas.duty / this.resultados.investimento;
        this.resultados.comparacao.percentual_fob = this.fob_calculado() / this.resultados.investimento;
        this.resultados.comparacao.percentual_hmf = this.custos.taxas.hmf / this.resultados.investimento;
        this.resultados.comparacao.percentual_mpf = this.custos.taxas.mpf / this.resultados.investimento;
        this.resultados.comparacao.percentual_taxas = this.custos.taxas.total_calculado() / this.resultados.investimento;

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
        setParametros: function(objParametros) {
            parametros = objParametros;
            estudo.parametros = objParametros;
            estudo._loadParametrosDoEstudo(objParametros);
        },
        zeraDadosDoEstudo: function() {
            estudo.zeraObj();
            estudo.zera.obj();
        },
        criaEstudoDoProduto: function(produto) {
            let obj = new EstudoDoProduto();
            obj.set.parametros(parametros);
            obj.set.estudo(estudo);
            obj.set.produto(produto);
            obj.set.custo_unitario(produto.custo_usd);
            return obj;
        },
        criaEstudo: function() {
            return estudo;
        },

        // 2
        totalizaDadosBasicosEstudo: function() {
            produtosDoEstudo.forEach(function (produto) {
                if(produto.estudo_do_produto.qtd <= 0) {
                    produto.estudo_do_produto.zeraObj();
                } else {
                    estudo.totalizaDadosBasicosDoEstudo(produto, estudo.parametros);
                }

            });
        },
        // 3
        totalizaCustosDoEstudo: function() {
            estudo.totalizaCustosAduaneiros(listaCustos);
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
                    // produto.estudo_do_produto.calculaMedidasDoProduto(produto, estudo);

                    // Cálculos de Proporcionalidade
                    produto.estudo_do_produto.calculaProporcionalidade(produto, estudo);

                    // Cálculos das Taxas: Duty, MPF, HMF e Total.
                    produto.estudo_do_produto.calculaTaxas(produto, estudo);

                    // Cálculo dos custos FBA
                    calculaCustosAmazonDoEstudoDoProduto(produto);

                    // Cálculo do total de custos proporcional do produto.
                    produto.estudo_do_produto.totalizaCustos(produto, estudo);

                    estudo.totaliza_custos_taxas(produto);

                    // calculaResultadosProduto(produto);
                    produto.estudo_do_produto.calculaResultados(estudo);

                    // Região para acumular os dados do Estudo
                    estudo.calculaResultados(produto);

                }

            });
        },

        totalizaDadosBasicosDoEstudo: function(produto, parametros) {
            estudo.totalizaDadosBasicosDoEstudo(produto, parametros);
        },
        loadEstudoComDadosConfig: function(parametros) {
            estudo.loadEstudoComDadosConfig(parametros);
        }
    }

}]);