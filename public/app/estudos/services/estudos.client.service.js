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
                auxFob += produto.estudo_do_produto.fob();
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
    this.despesas = {
        comerciais: {
            amazon: {
                fulfillment: function() {
                    let auxSoma = 0;
                    if(parent.fob()) {
                        parent.lista_produtos.forEach(function (produto) {
                            auxSoma += produto.estudo_do_produto.despesas.comerciais.amazon.fulfillment();
                        });
                    }
                    return auxSoma;
                },
                comissoes: function() {
                    let auxSoma = 0;
                    if(parent.fob()) {
                        parent.lista_produtos.forEach(function (produto) {
                            auxSoma += produto.estudo_do_produto.despesas.comerciais.amazon.comissoes();
                        });
                    }
                    return auxSoma;
                },
                total: function(tipo) {
                    if(parent.fob()) {
                        switch (tipo) {
                            case 'fulfillment':
                                return this.fulfillment();
                            case 'comissoes':
                                return this.comissoes();
                            default:
                                return this.fulfillment() + this.comissoes();
                        }
                    }
                    return 0;
                }
            },
            total: function(tipo) {
                if(parent.fob()) {
                    return this.amazon.total(tipo);
                }
                return 0;
            }
        },
        armazenamento: {
            amazon: {
                inventory: function() {
                    return 0;
                },
                placement: function() {
                    return 0;
                },
                total: function(tipo) {
                    if(parent.fob()) {
                        switch (tipo) {
                            case 'inventory':
                                return this.inventory();
                            case 'placement':
                                return this.placement();
                            default:
                                return this.inventory() + this.placement();
                        }
                    }
                    return 0;
                }
            },
            total: function(tipo) {
                if(parent.qtd) {
                    return this.amazon.total(tipo);
                }
                return 0;
            }
        },
        administrativas: {
            total: function() {
                return 0;
            }
        },
        outras: {
            total: function() {
                return 0;
            }
        },
        total: function(categoria, subtipo) {
            if(parent.fob()) {
                switch (categoria) {
                    case 'comerciais':
                        return this.comerciais.total(subtipo);
                    case 'armazenamento':
                        return this.armazenamento.total(subtipo);
                    case 'administrativas':
                        return this.administrativas.total();
                    case 'outras':
                        return this.outras.total();
                    default:
                        return this.comerciais.total() + this.armazenamento.total() + this.administrativas.total() + this.outras.total();
                }
            }
            return 0;
        }
    };
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
        investimento: function() {
            let fob = parent.fob();
            if(fob) {
                return parent.fob() + parent.custos.total();
            }
            return 0;
        },
        despesas: function() { // Custo que as despesas comerciais (amazon) representam na operação.
            let fob = parent.fob();
            if(fob) {
                return parent.despesas.total();
            }
            return 0;
        },
        lucro: function() {
            let somaLucro = 0;
            if(parent.fob()) {
                parent.lista_produtos.forEach(function (produto) {
                    somaLucro += ((produto.estudo_do_produto.resultados.precos.venda * produto.estudo_do_produto.qtd) - produto.estudo_do_produto.resultados.investimento() - produto.estudo_do_produto.resultados.despesas());
                });
            }
            return somaLucro;
        },
        roi: function() {
            let fob = parent.fob();
            let investimento = parent.resultados.investimento();
            if(fob && investimento) {
                return this.lucro() / investimento;
            }
            return 0;
        }, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
        comparacao: {
            percentual_frete: function() {
                return parent.custos.frete_maritimo.total() / parent.resultados.investimento();
            },
            percentual_fob: function() {
                return parent.fob() / parent.resultados.investimento();
            },
            percentual_duties: function() {
                return parent.custos.taxas.duty() / parent.resultados.investimento();
            },
            percentual_mpf: function() {
                return parent.custos.taxas.mpf() / parent.resultados.investimento();
            },
            percentual_hmf: function() {
                return parent.custos.taxas.hmf() / parent.resultados.investimento();
            },
            percentual_custos: function() {
                return parent.custos.total() / parent.resultados.investimento();
            },
            percentual_taxas: function() {
                return parent.custos.taxas.total() / parent.resultados.investimento();
            }
        }
    };
    this.display = {
        relatorio: {
            analises: {
                geral: {
                    fob: function() {
                        if(parent.fob()) {
                            return parent.fob();
                        }
                        return 0;
                    },
                    custos: function() {
                        if(parent.fob()) {
                            return parent.custos.total();
                        }
                    },
                    despesas: function () {
                        if (parent.fob()) {
                            return parent.despesas.total();
                        }
                        return 0;
                    },
                    investimento: {
                        importacao: function () {
                            if (parent.fob()) {
                                return parent.resultados.investimento();
                            }
                            return 0;
                        },
                        total: function() {
                            if(parent.fob()) {
                                return parent.resultados.investimento() + parent.resultados.despesas();
                            }
                            return 0;
                        }

                    },
                    despesass: {
                        amazon: {
                            fulfillment: function () {
                                if (parent.fob()) {
                                    return parent.despesas.comerciais.amazon.fulfillment();
                                }
                                return 0;
                            },
                            comissoes: function () {
                                if (parent.fob()) {
                                    return parent.despesas.comerciais.amazon.comissoes();
                                }
                            }
                        },
                        total: function() {
                            if(parent.fob()) {
                                return parent.despesas.comerciais.amazon.total();
                            }
                            return 0;
                        }
                    },
                },
                despesas: {
                    comerciais: function() {
                        if(parent.fob()) {
                            return parent.despesas.comerciais.total();
                        }
                        return 0;
                    },
                    armazenamento: function() {
                        if(parent.fob()) {
                            return parent.despesas.armazenamento.total();
                        }
                        return 0;
                    },
                    administrativas: function() {
                        if(parent.fob()) {
                            return parent.despesas.administrativas.total();
                        }
                        return 0;
                    },
                    outras: function() {
                        if(parent.fob()) {
                            return parent.despesas.outras.total();
                        }
                        return 0;
                    },
                    total: function() {
                        if(parent.fob()) {
                            return parent.despesas.total();
                        }
                        return 0;
                    }
                },
                custos: function() {

                }
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


}

let listasDoEstudo = {
    produtosDoEstudo: []
};

function EstudoDoProduto() {
    let parent = this;
    this.produto = {};
    this.estudo = {};
    this.qtd = 0;
    this.venda_media = {
        diaria: {
            unidades: 0,
        },
        mensal: {
            unidades: 0
        },
        converte: {
            dia_para_mes: function() {
                if(parent.qtd && parent.venda_media.diaria.unidades) {
                    return parent.qtd / (parent.venda_media.diaria.unidades * 30);
                }
                return '';
            }
        },
        calcula: {
            venda: {
                mensal: function() {
                    return parent.venda_media.diaria.unidades * parent.qtd;
                }
            }
        }
    };
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
                let qtd = parent.qtd;
                let estudo_fob = parent.estudo.fob();
                if(qtd && estudo_fob) {
                    return parent.fob() / estudo_fob;
                }
                return 0;
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
                    return parent.medidas.proporcionalidade.fob() * parent.estudo.custos.aduaneiros.total();
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
    this.despesas = {
        comerciais: {
            amazon: {
                fulfillment: function() {
                    if(parent.qtd) {
                        return parent.modulos.amazon.fba.fulfillment * parent.qtd;
                    }
                    return 0;
                },
                comissoes: function() {
                    if(parent.qtd) {
                        return parent.resultados.precos.venda * parent.parametros().comissao_amazon * parent.qtd;
                    }
                    return 0;
                },
                total: function() {
                    if(parent.qtd) {
                        return this.fulfillment() + this.comissoes();
                    }
                    return 0;
                }
            },
            total: function() {
                if(parent.qtd) {
                    return this.amazon.total();
                }
                return 0;
            }
        },
        armazenamento: {
            amazon: {
                inventory: function() {
                    return 0;
                },
                placement: function() {
                    return 0;
                },
                total: function() {
                    if(parent.qtd) {
                        return this.inventory() + this.placement();
                    }
                    return 0;
                }
            },
            total: function(tipo) {
                if(parent.qtd) {
                    return this.amazon.total(tipo);
                }
                return 0;
            }
        },
        administrativas: {
            total: function() {
                return 0;
            }
        },
        outras: {
            total: function() {
                return 0;
            }
        },
        total: function() {
            if(parent.qtd) {
                return this.comerciais.total() + this.armazenamento.total() + this.administrativas.total() + this.outras.total();
            }
            return 0;
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
    this.resultados = {
        investimento: function() {
            if(parent.qtd) {
                return parent.fob() + parent.custos.total();
            }
            return 0;
        },
        despesas: function() {
            if(parent.qtd) {
                return parent.despesas.total();
            }
        },
        lucro: function() {
            if(parent.qtd && parent.resultados.precos.venda) {
                return (parent.resultados.precos.venda * parent.qtd) - (parent.resultados.investimento() + parent.resultados.despesas());
            }
            return 0;
        },
        roi: function() {
            let invest = this.investimento();
            if(parent.qtd && invest) {
                return (this.lucro() / invest);
            }
            return 0;
        }, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
        precos: {
            custo: {
                importacao: function() {
                    if(parent.qtd) {
                        return parent.resultados.investimento() / parent.qtd;
                    }
                    return 0;
                },
                despesas: function() {
                    if(parent.qtd) {
                        return (parent.resultados.despesas() / parent.qtd);
                    }
                    return 0;
                },
                total: function() {
                    if(parent.qtd) {
                        return ((parent.resultados.investimento() + parent.resultados.despesas()) / parent.qtd);
                    }
                }
            },
            venda: 0, // preço de venda - informado na tabela de produtos do estudo.
        }
    };
    this.display = {
        relatorio: {
            tabela_de_produtos: {
                custos_unitarios: {
                    importacao: function() {
                        if(parent.qtd) {
                            return parent.resultados.precos.custo.importacao();
                        }
                        return 0;
                    },
                    amazon: {
                        fba: function() {
                            if(parent.qtd) {
                                return parent.despesas.comerciais.amazon.fulfillment() / parent.qtd;
                            }
                            return 0;
                        },
                        comissoes: function() {
                            if(parent.qtd) {
                                return parent.despesas.comerciais.amazon.comissoes() / parent.qtd;
                            }
                            return 0;
                        },
                    },
                    total: function() {
                        if(parent.qtd) {
                            return parent.display.relatorio.custos.importacao.unitario() + parent.display.relatorio.custos.despesas.unitario();
                        }
                        return 0;
                    },
                },
                custos: {
                    importacao: function() {
                        if(parent.qtd) {
                            return parent.resultados.precos.custo.importacao() * parent.qtd;
                        }
                        return 0;
                    },
                    amazon: {
                        fba: function() {
                            if(parent.qtd) {
                                return parent.despesas.comerciais.amazon.fulfillment();
                            }
                            return 0;
                        },
                        comissoes: function() {
                            if(parent.qtd) {
                                return parent.despesas.comerciais.amazon.comissoes();
                            }
                            return 0;
                        },
                    },
                    total: function() {
                        if(parent.qtd) {
                            return parent.custos.total();
                        }
                        return 0;
                    },
                },
                principal: {
                    frete: function() {
                        if(parent.qtd) {
                            return parent.custos.frete_maritimo.valor();
                        }
                        return 0;
                    },
                    custos_aduaneiros: function() {
                        if(parent.qtd) {
                            return parent.custos.aduaneiros.total();
                        }
                        return 0;
                    },
                    taxas: function() {
                        if(parent.qtd) {
                            return parent.custos.taxas.total();
                        }
                        return 0;
                    },
                    conny: function() {
                        if(parent.qtd) {
                            return parent.custos.comissao_conny.total();
                        }
                        return 0;
                    },
                    custos: function() {
                        if(parent.qtd) {
                            return parent.custos.total();
                        }
                        return 0;
                    }
                },
                despesas: {

                }
            },
            custos: {
                importacao: {
                    unitario: function() {
                        if(parent.qtd) {
                            return parent.resultados.precos.custo.importacao();
                        }
                        return 0;
                    },
                    somatorio: function() {
                        if(parent.qtd) {
                            return this.unitario() * parent.qtd;
                        }
                    }
                },
                despesas: {
                    unitario: function() {
                        if(parent.qtd) {
                            return parent.resultados.despesas() / parent.qtd;
                        }
                        return 0;
                    },
                    somatorio: function() {
                        if(parent.qtd) {
                            return parent.resultados.despesas();
                        }
                        return 0;
                    }
                },
                total: {
                    unitario: function() {
                        if(parent.qtd) {
                            return parent.display.relatorio.custos.importacao.unitario() + parent.display.relatorio.custos.despesas.unitario();
                        }
                        return 0;
                    },
                    somatorio: function() {
                        if(parent.qtd) {
                            return parent.display.relatorio.custos.importacao.total() + parent.display.relatorio.custos.despesas.total();
                        }
                        return 0;
                    }
                }
            },
            despesas: {
                comerciais: {
                    amazon: {
                        fba: {
                            unitario: function() {
                                if(parent.qtd) {
                                    return parent.despesas.comerciais.amazon.fulfillment() / parent.qtd;
                                }
                                return 0;
                            },
                            somatorio: function() {
                                if(parent.qtd) {
                                    return parent.despesas.comerciais.amazon.fulfillment();
                                }
                                return 0;
                            }
                        },
                        comissoes: {
                            unitario: function() {
                                if(parent.qtd) {
                                    return parent.despesas.comerciais.amazon.comissoes() / parent.qtd;
                                }
                                return 0;
                            },
                            somatorio: function() {
                                if(parent.qtd) {
                                    return parent.despesas.comerciais.amazon.comissoes();
                                }
                                return 0;
                            }
                        }
                    }
                }
            }
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
        criaEstudo: function() {
            estudo.load.lista_custos_aduaneiros(listaCustosAduaneiros);
            estudo.load.parametros(parametros);
            return estudo;
        },

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
