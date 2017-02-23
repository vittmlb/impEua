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

let produtosDoEstudo = [];

function Estudo() {
    let parent = this;
    this.lista_produtos = [];
    this.lista_custos_aduaneiros = [];
    this.nome_estudo = '';
    this.parametros = {
        volume_cntr_20: 0,
        frete_maritimo: 0,
        seguro_frete_maritimo: 0,
        comissao_amazon: 0,
        percentual_comissao_conny: 0,
        mpf: 0,
        hmf: 0,
    };
    this.fob = function() {
        let auxFob = 0;
        this.lista_produtos.forEach(function (produto) {
            if(produto.estudo_do_produto.qtd) {
                auxFob = produto.estudo_do_produto.fob();
            }
        });
        return auxFob;
    };
    this.cif = 0;
    this.medidas = {
        peso: {
            contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
            ocupado: 0,
            ocupado_percentual: function() {
                if(this.contratado) {
                    return this.ocupado / this.contratado;
                }
                return 0;
            }
        },
        volume: {
            contratado: function() {
                return parent.parametros.volume_cntr_20;
            },
            ocupado: 0,
            ocupado_percentual: function() { // Valor utilizado para definir o percentual do contêiner que já foi utilizado.
                if(this.contratado()) {
                    return this.ocupado / this.contratado();
                }
                return 0;
            }
        }
    };
    this.custos = {
        comissao_conny: {
            total: function() {
                return parent.fob() * parent.parametros.percentual_comissao_conny;
            }
        }, // todo: Implementar comissão Conny
        aduaneiros: {
            lista: [],
            total: function() {
                let aux = 0;
                if(parent.fob()) {
                    this.lista.forEach(function (item) {
                        if(item.tipo === 'Valor' && item.ativo === true) {
                            aux += item.valor;
                        }
                    });
                }
                return aux;
            }
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
            total: function() { // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
                return 0;
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
            total: function() {
                return 0;
            }
        },
        frete_maritimo: {
            valor: function() {
                return parent.parametros.frete_maritimo;
            },
            seguro: function() {
                return parent.parametros.seguro_frete_maritimo;
            },
            total: function() {
                return this.valor() + this.seguro();
            }
        },
        taxas: {
            duty: function() {
                let auxSoma = 0;
                if(parent.lista_produtos.length) {
                    parent.lista_produtos.forEach(function (produto) {
                        if(produto.estudo_do_produto.qtd) {
                            auxSoma += produto.estudo_do_produto.custos.taxas.duty();
                        }
                    });
                }
                return auxSoma;
            },
            mpf: function() {
                let auxSoma = 0;
                if(parent.lista_produtos.length) {
                    parent.lista_produtos.forEach(function (produto) {
                        if(produto.estudo_do_produto.qtd) {
                            auxSoma += produto.estudo_do_produto.custos.taxas.mpf();
                        }
                    });
                }
                return auxSoma;
            },
            hmf: function() {
                let auxSoma = 0;
                if(parent.lista_produtos.length) {
                    parent.lista_produtos.forEach(function (produto) {
                        if(produto.estudo_do_produto.qtd) {
                            auxSoma += produto.estudo_do_produto.custos.taxas.hmf();
                        }
                    });
                }
                return auxSoma;
            },
            total: function() {
                return this.duty() + this.mpf() + this.hmf();
            }
        },
        total: function() {
            if(parent.fob()) {
                return this.aduaneiros.total() + this.frete_maritimo.total() + this.taxas.total();
            }
            return 0;
        }
    };
    this.despesas = {};
    this.modulos = {
        amazon: {
            fba: {
                fulfillment: 0,
                inventory: 0,
                placement: 0
            },
            comissoes: 0
        }
    };
    this.resultados = {
        investimento: {
            importacao: function() {
                return parent.fob() + parent.custos.total();
            },
            despesas: function() { // Custo que as despesas comerciais (amazon) representam na operação.
                let auxSoma = 0;
                if(parent.lista_produtos.length) {
                    parent.lista_produtos.forEach(function (produto) {
                        if(produto.estudo_do_produto.qtd) {
                            auxSoma += (produto.estudo_do_produto.modulos.amazon.fba.fulfillment * produto.estudo_do_produto.qtd);
                        }
                    });
                }
                return auxSoma;
            },
            total: function() {
                return parent.resultados.investimento.importacao() + parent.resultados.investimento.despesas(); // o 'this' não funcionou com "despesas"
            }
        },
        lucro: 0,
        roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
        comparacao: {
            percentual_frete: function() {
                return parent.custos.frete_maritimo.total() / parent.resultados.investimento;
            },
            percentual_fob: function() {
                return parent.fob / parent.resultados.investimento;
            },
            percentual_duties: function() {
                return parent.custos.taxas.duty / parent.resultados.investimento;
            },
            percentual_mpf: function() {
                return parent.custos.taxas.mpf / parent.resultados.investimento;
            },
            percentual_hmf: function() {
                return parent.custos.taxas.hmf / parent.resultados.investimento;
            },
            percentual_custos: function() {
                return parent.custos.total / parent.resultados.investimento;
            },
            percentual_taxas: function() {
                return parent.custos.taxas.total_calculado() / parent.resultados.investimento;
            }
        }
    };

    this.load = {
        parametros: function(parametros) {
            parent.set._parametros(parametros);
        },
        lista_custos_aduaneiros: function(listaCustosAduaneiros) {
            parent.set._lista_custos_aduaneiros(listaCustosAduaneiros);
        }
    };

    this.ini = {
        medidas: function() {
            parent.zera._medidas();
            parent.lista_produtos.forEach(function (produto) {
                parent.medidas.peso.ocupado += produto.estudo_do_produto.medidas.peso.ocupado();
                parent.medidas.volume.ocupado += produto.estudo_do_produto.medidas.volume.ocupado();
            });
        }
    };

    this.set = {
        _parametros: function(parametros) {
            parent.parametros = parametros;
        },
        _lista_custos_aduaneiros: function(listaCustosAduaneiros) {
            parent.custos.aduaneiros.lista = listaCustosAduaneiros;
        }
    };

    this.zera = {
        obj: function() {
            this._cif();
            this._custos();
            this._modulos.amazon();
            this._medidas();
            this._resultados();
        },
        _cif: function() {
            parent.cif = 0;
        },
        _custos: function() {
            // Aguardando aqui para ver a abordagem no caso das despesas nacionais e internacionais.
        },
        _medidas: function() {
            parent.medidas.peso.ocupado = 0;
            parent.medidas.volume.ocupado = 0;
        },
        _resultados: function() {
            // Aguardando para ver se vou precisar fazer algo aqui.
        },
        _modulos: {
            amazon: function() {
                parent.modulos.amazon.fba.fulfillment = 0;
                parent.modulos.amazon.fba.inventory = 0;
                parent.modulos.amazon.fba.placement = 0;
                parent.modulos.amazon.comissoes = 0;
                parent.modulos.amazon.categoria = '';
            }
        }
    };

    this.totaliza = {
        custos: {
            /**
             * Incrementa os totais dos tributos do estudo "geral" com base nos valores de cada produto passado como argumento.
             * @param produto
             */
            taxas: function(produto) {
                let estProduto = produto.estudo_do_produto;

                // Update (soma) dos valores dos impostos ao Estudo Geral.
                parent.custos.taxas.duty += estProduto.custos.taxas.duty;
                parent.custos.taxas.mpf += estProduto.custos.taxas.mpf;
                parent.custos.taxas.hmf += estProduto.custos.taxas.hmf;
                parent.custos.taxas.total += estProduto.custos.taxas.total;
            },
        },
        resultados: function(produto) {
            // Região para acumular os dados do Estudo
            parent.resultados.investimento += produto.estudo_do_produto.resultados.investimento;
            // Update (soma) dos lucros dos produtos para formar o Lucro Total do Estudo.
            parent.resultados.lucro += produto.estudo_do_produto.resultados.lucro;
            parent.resultados.roi = parent.resultados.lucro / parent.resultados.investimento;
        }
    };

    this.teste = {
        setMedida: function(valor) {
            parent.medidas.volume.ocupado = valor;
        }
    };


    this.totalizaDadosBasicosDoEstudo = function(produto) {
        this.fob = 0;
        this.medidas.peso.ocupado = 0;
        this.medidas.volume.ocupado = 0;
        this.medidas.volume.ocupado_percentual = 0;

        this.fob += ((produto.estudo_do_produto.custo_unitario * produto.estudo_do_produto.qtd) * (1 + this.parametros.percentual_comissao_conny)); // Calcula Fob
        this.cif = this.fob + this.custos.frete_maritimo.total();
        this.medidas.peso.ocupado += produto.medidas.peso * produto.estudo_do_produto.qtd; // Calcula peso total
        this.medidas.volume.ocupado += produto.medidas.cbm * produto.estudo_do_produto.qtd; // Calcula volume ocupado no contêiner
        this.medidas.volume.ocupado_percentual = (this.medidas.volume.ocupado / this.medidas.volume.contratado) * 100;
    };


}

let listasDoEstudo = {
    produtosDoEstudo: []
};

function EstudoDoProduto() {
    let parent = this;
    this.produto = {};
    this.estudo = {};
    this.qtd = 0;
    this.parametros = function() {
        return this.estudo.parametros;
    };
    this.custo_unitario = function() {
        return this.produto.custo_usd;
    }; // Não lembro o como funciona isso aqui.
    this.fob = function() {
        return ((this.custo_unitario() * (1 + this.parametros().percentual_comissao_conny)) * this.qtd);
    };
    this.cif = function() {
        return ((this.custo_unitario() * (1 + this.parametros().percentual_comissao_conny)) * this.qtd) + this.custos.frete_maritimo.total();
    };
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
            fob: function() {
                if(parent.estudo.medidas.peso.ocupado) {

                }
            },
            peso: 0,
            volume: function() {
                return parent.medidas.volume.ocupado_percentual();
            }
        }
    };
    this.custos = {
        comissao_conny: {
            total: function() {
                if(parent.qtd) {
                    return (parent.qtd * parent.custo_unitario() * parent.parametros().percentual_comissao_conny);
                }
                return 0;
            }
        },
        aduaneiros: {
            lista: [],
            total: function() {
                if(parent.qtd) {
                    return parent.medidas.proporcionalidade.volume() * parent.estudo.custos.aduaneiros.total();
                }
                return 0;
            }
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
            total: function() { // Custos internacionais totais - Somatório das custos compartilhadas com as individualizadas
                return 0;
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
            total: function() {
                return 0;
            }
        },
        frete_maritimo: {
            valor: function() {
                if(parent.qtd) {
                    return parent.parametros().frete_maritimo * parent.medidas.proporcionalidade.volume();
                }
                return 0;
            },
            seguro: function() {
                if(parent.qtd) {
                    return parent.parametros().seguro_frete_maritimo * parent.medidas.proporcionalidade.volume();
                }
                return 0;
            },
            total: function() {
                return this.valor() + this.seguro();
            }
        },
        taxas: {
            duty: function() {
                return parent.fob() * parent.produto.duty;
            },
            mpf: function() {
                let aux = parent.fob() * parent.parametros().mpf;
                if(parent.qtd) {
                    if(aux < 35) {
                        return 35;
                    } else if(aux > 485) {
                        return 485;
                    }
                }
                return aux;
            },
            hmf: function() {
                return parent.fob() * parent.parametros().hmf;
            },
            total: function() {
                if(parent.qtd) {
                    return this.duty() + this.mpf() + this.hmf();
                }
                return 0;
            },
        },
        total: function() {
            if(parent.qtd) {
                return this.aduaneiros.total() + parent.custos.frete_maritimo.total() + this.taxas.total();
            }
            return 0;
        }
    };
    this.despesas = {};
    this.resultados = {
        investimento: {
            importacao: function() {
                if(parent.qtd) {
                    return parent.fob() + parent.custos.total();
                }
                return 0;
            },
            despesas: function() { // Custo que as despesas comerciais (amazon) representam na operação.
                if(parent.qtd) {
                    return parent.modulos.amazon.fba.fulfillment * parent.qtd;
                }
                return 0;
            },
            total: function() {
                if(parent.qtd) {
                    return this.importacao() + parent.resultados.investimento.despesas(); // o 'this' não funcionou com "despesas"
                }
                return 0;
            }
        },
        lucro: function() {
            if(parent.qtd) {
                return ((parent.resultados.precos.venda * (1 - parent.parametros().comissao_amazon)) - parent.resultados.precos.custo()) * parent.qtd;
            }
            return 0;
        },
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
            custo: function() {
                if(parent.qtd) {
                    return parent.resultados.investimento.total() / parent.qtd;
                }
            }, // preço de custo final do produto.
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

    this.load = {
        estudo: function(estudo) {
            parent.set._estudo(estudo);
        },
        produto: function(produto) {
            parent.set._produto(produto);
        },
        custo_unitario: function(custo_unitario) {
            parent.set._custo_unitario(custo_unitario);
        }
    };

    this.set = {
        modulos: {
            amazon: function(modulo) {
                parent.modulos.amazon = modulo;
            }
        },
        _estudo: function(estudo) {
            parent.estudo = estudo;
        },
        _produto: function(produto) {
            parent.produto = produto;
        },
        _custo_unitario: function(custo_unitario) {
            parametros.custo_unitario = custo_unitario;
        },
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

angular.module('estudos').factory('CompEstudos', ['Custos', 'CompAmazon', '$http', function (Custos, CompAmazon, $http) {

    let listaCustosAduaneiros = Custos.query();
    let estudo = new Estudo();

    $http.get('/app/data/parametros_estudo.json').success(function (data) {
        estudo.parametros = data;
    });

    function calculaCustosAmazonDoEstudoDoProduto(produto) {
        let modulo_amazon = CompAmazon.calculo(produto);
        produto.estudo_do_produto.set.modulos.amazon(modulo_amazon);
    }

    function Bamonos() {
        estudo.zera.obj();
        estudo.ini.medidas();
        estudo.lista_produtos.forEach(function (produto) {
            calculaCustosAmazonDoEstudoDoProduto(produto);
        });
    }

    return {
        loadProdutosDoEstudo: function(listaDeProdutosDoEstudo) {
            produtosDoEstudo.lista = listaDeProdutosDoEstudo;
        },
        loadParametros: function(objParametros) {
            parametros = objParametros;
        },
        iniProcesso: function() {
            Bamonos();
        },
        zeraDadosDoEstudo: function() {
            estudo.zera.obj();
        },
        criaEstudoDoProduto: function(produto) {
            let obj = new EstudoDoProduto();
            obj.load.estudo(estudo);
            obj.load.produto(produto);
            obj.load.custo_unitario(produto.custo_usd);
            return obj;
        },
        criaListaProdutosDoEstudo: function() {
            return listasDoEstudo.produtosDoEstudo;
        },
        criaEstudo: function() {
            estudo.load.lista_custos_aduaneiros(listaCustosAduaneiros);
            estudo.load.parametros(parametros);
            return estudo;
        },
        criaParametros: function() {
            return parametros;
        },

        // 2
        // totalizaDadosBasicosEstudo: function() {
        //     produtosDoEstudo.forEach(function (produto) {
        //         if(produto.estudo_do_produto.qtd <= 0) {
        //             produto.estudo_do_produto.zeraObj();
        //         } else {
        //             estudo.totalizaDadosBasicosDoEstudo(produto, estudo.parametros);
        //         }
        //
        //     });
        // },
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
