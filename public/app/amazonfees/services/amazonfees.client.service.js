/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonfees').factory('Amazonfees', ['$resource', function ($resource) {
    return $resource('/api/amazonfees/:amazonfeeId', {
        amazonfeeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

let opt = {
    shortest: 'shortest side',
    median: 'median side',
    longest: 'longest side',
    girth: 'longest plus girth',
    operador: {
        igual: 'igual',
        maior: 'maior',
        menor: 'menor',
        maior_ou_igual: 'maior ou igual',
        menor_ou_igual: 'menor ou igual'
    },
    tipo: {
        vigencia: 'Vigência',
        intervalo_data: 'Intervalo Data',
        dimensionamento: 'Dimensionamento',
        pesagem: 'Pesagem',
        medida: 'medida',
        volume: 'volume',
        peso: 'peso',
        data: 'data'
    },
    unidade: {
        oz: 'oz',
        lb: 'lb',
        polegadas: 'polegadas',
        metro: 'metro',
        m3: 'm3'
    },
    lista: {
        fba: 'fba',
        misf: 'misf'
    },
    fee: {
        fulfillment: 'FBA Fulfillment Fees',
        misf: 'Monthly Inventory Storage Fees',
        placement: 'Inventory Placement Service Fees'
    }
};

let flags = {
    vigencia: true,
    intervalo_data: true,
    dimensionamento: false,
    pesagem: false
};

let listas = {
    listaFees: [],
    set: function(listaFees) {
        this.listaFees = listaFees;
    },
    get: function(tipoLista) {
        switch (tipoLista) {
            case opt.lista.fba:
                return this.fba();
            case opt.lista.misf:
                return this.misf();
        }
    },
    fba: function() {
        let listaFba = this.listaFees.filter(function (data) {
            if (data.tipo_fee === opt.fee.fulfillment) {
                return data;
            }
        });
        return listaFba.sort(function (a, b) {
            return (a.precedencia - b.precedencia);
        });
    },
    misf: function() {
        let listaMisf = this.listaFees.filter(function (data) {
            if (data.tipo_fee === opt.fee.misf) {
                return data;
            }
        });
        return listaMisf.sort(function (a, b) {
            return (a.precedencia - b.precedencia);
        });
    }
};

let RuleAux = function() {
    let parent = this;
    this.parametros =  {
        dimensoes: {
            longest: -1,
            shortest: -1,
            median: -1,
            girth: -1
        },
        peso: function(und) {
            switch (und) {
                case opt.unidade.oz:
                    return parent.converte.convKgToOz(parent.produto.embalagem.peso.bruto);
                case opt.unidade.lb:
                    return parent.converte.convKgToLb(parent.produto.embalagem.peso.bruto);
                default:
                    return 0;
            }
        },
        volume: -1,
        estoque: {
            inicial: function() {
                return parent.produto.estudo_do_produto.qtd * parent.parametros.estoque.volume_unitario();
            },
            volume_unitario: function() {
                return parent.produto.embalagem.dimensoes.altura * parent.produto.embalagem.dimensoes.largura * parent.produto.embalagem.dimensoes.comprimento;
            },
            volume_venda_mensal: function() {
                return parent.parametros.estoque.volume_unitario() * parent.produto.estudo_do_produto.venda_media.calcula.venda.mensal();
            }
        },
        meses: -1,
    };
    this.produto = {};
    this.fee = {};
    this.get = {
        peso: function(unidade) {
            // switch (unidade) {
            //     case opt.unidade.oz:
            //         return parent.ruleparams.peso.oz, regra.dados_rule.valor, regra.operador_rule);
            //     case 'lb':
            //         return avaliador.eval_operadores(params.peso.lb, regra.dados_rule.valor, regra.operador_rule);
            //     default:
            //         return 0;
            // }
        }
    };
    this.set = {
        produto: function(objProduto) {
            parent.produto = objProduto;
        },
        parametros: function() {
            let dim = parent.produto.embalagem.dimensoes;
            let array = [dim.largura, dim.comprimento, dim.altura].sort();
            parent.parametros.dimensoes.shortest = parent.converte.convMetroToPolegada(array[0]);
            parent.parametros.dimensoes.median = parent.converte.convMetroToPolegada(array[1]);
            parent.parametros.dimensoes.longest = parent.converte.convMetroToPolegada(array[2]);
            parent.parametros.dimensoes.girth =  2 * (parent.parametros.dimensoes.median + parent.parametros.dimensoes.shortest); // já está convertido para polegadas.
        },
        fee: function(objFee) {
            parent.fee = objFee;
        },
        rule: function(objRule) {
            parent.rule = objRule;
        }
    };
    this.rule = {};
    this.produto = {};

    this.calcula = {
        fulfillment: {
            base: function() {
                return parent.fee.dados_fee.valor;
            },
            extra: function() {
                if(parent.fee.tem_valor_calculado) {
                    let base = parent.parametros.peso(opt.unidade.lb) - parent.fee.dados_fee.calculado.franquia;
                    let multiplicador = parent.fee.dados_fee.calculado.multiplicador;
                    return base * multiplicador;
                }
                return 0;
            },
            total: function() {
                return this.base() + this.extra();
            }
        },
        inventory: function() {
            let cbmVendaMensal = parent.parametros.estoque.volume_venda_mensal();
            if (!cbmVendaMensal) return 0;
            let estoque = parent.parametros.estoque.inicial();
            let multiplicador = parent.fee.dados_fee.calculado.multiplicador;
            let valor = 0;
            while(estoque > 0) {
                valor += (multiplicador * estoque);
                estoque = estoque - cbmVendaMensal;
            }
            return valor / parent.produto.estudo_do_produto.qtd;
        }
    };


    this.eval = {
        dimensionamento: {
            tipo_rule: function () {
                switch (parent.rule.tipo_rule) {
                    case opt.tipo.peso:
                        return parent.eval.peso();
                    case opt.tipo.medida:
                        return parent.eval.medidas();
                    default:
                        return false;
                }
            }
        },
        peso: function() {
            let peso = parent.parametros.peso(parent.rule.dados_rule.unidade);
            let valor = parent.rule.dados_rule.valor;
            let operador = parent.rule.operador_rule;
            return parent.eval.operadores(peso, valor, operador);
        },
        medidas: function() {
            let params = parent.parametros;
            let regra = parent.rule;
            switch (parent.rule.params_rule.lados) {
                case opt.shortest:
                    return parent.eval.operadores(params.dimensoes.shortest, regra.dados_rule.valor, regra.operador_rule);
                case opt.median:
                    return parent.eval.operadores(params.dimensoes.median, regra.dados_rule.valor, regra.operador_rule);
                case opt.longest:
                    return parent.eval.operadores(params.dimensoes.longest, regra.dados_rule.valor, regra.operador_rule);
                case opt.girth:
                    return parent.eval.operadores((params.dimensoes.longest + params.dimensoes.girth), regra.dados_rule.valor, regra.operador_rule);
                default:
                    return 0;
            }
        },
        operadores: function (param_1, param_2, operator) {
            switch (operator) {
                case opt.operador.igual:
                    return (param_1 === param_2);
                case opt.operador.maior:
                    return (param_1 > param_2);
                case opt.operador.menor:
                    return (param_1 < param_2);
                case opt.operador.maior_ou_igual:
                    return (param_1 >= param_2);
                case opt.operador.menor_ou_igual:
                    return (param_1 <= param_2);
                default:
                    return 0;
            }
        },
    };
    this.converte = {
        convKgToOz: function (kg) {
            return kg * 35.274;
        },
        convKgToLb: function (kg) {
            return kg * 2.20462;
        },
        convMetroToPolegada: function(m) {
            return m * 39.3701;
        }
    }

};

let ModuloAmz = function() {
    let parent = this;
    this.modulo = {
        fba: {
            fulfillment: {
                nome_fee: '',
                valor: 0,
                inspectedRules: [{
                    params: {},
                    rule_set: []
                }]
            },
            inventory: {
                nome_fee: '',
                valor: 0,
                inspectedRules: [{
                    params: {},
                    rule_set: []
                }]
            },
            placement: {
                nome_fee: '',
                valor: 0,
                inspectedRules: [{
                    params: {},
                    rule_set: []
                }]
            },
        },
        comissoes: 0,
    };
    this.set = {
        modulo: function(aux, tipoLista) {
            switch (tipoLista) {
                case opt.lista.fba:
                    parent.modulo.fba.fulfillment.valor = aux.calcula.fulfillment.total();
                    parent.modulo.fba.fulfillment.nome_fee = aux.fee.nome_fee;
                    return true;
                case opt.lista.misf:
                    parent.modulo.fba.inventory.valor = aux.calcula.inventory();
                    parent.modulo.fba.inventory.nome_fee = aux.fee.nome_fee;
            }
        },
        inspectedRules: function(aux, rule_set, tipoLista) {
            switch (tipoLista) {
                case opt.lista.fba:
                    parent.modulo.fba.fulfillment.inspectedRules.push({"params": aux.parametros, "rule_set": rule_set});
                    return true;
                case opt.lista.misf:
                    parent.modulo.fba.inventory.inspectedRules.push({"params": aux.parametros, "rule_set": rule_set});
                   return true;
            }
        }
    };
    this.unset = {
        inspectedRules: function(aux, tipoLista) {
            switch (tipoLista) {
                case opt.lista.fba:
                    parent.modulo.fba.fulfillment.inspectedRules = [];
                    return true;
                case opt.lista.misf:
                    parent.modulo.fba.inventory.inspectedRules = [];
                    return true;
            }
        }
    };
};


angular.module('amazonfees').factory('CompAmazon', ['Amazonfees', function(Amazonfees) {

    listas.set(Amazonfees.query());
    let amz = new ModuloAmz();
    let tipoLista = '';

    function novoTeste(produto) {
        eval_fees(produto, opt.lista.fba);
        eval_fees(produto, opt.lista.misf);
        return amz.modulo;
    }

    function eval_fees(produto, tipoDaLista) {
        tipoLista = tipoDaLista;
        let lista = listas.get(tipoLista);
        let aux = new RuleAux();
        aux.set.produto(produto);
        aux.set.parametros();
        for(let i = 0; i < lista.length; i++) {
            aux.set.fee(lista[i]);
            if(!eval_dim(aux, lista[i])) {
                amz.unset.inspectedRules(aux, tipoLista);
                continue;
            }
            if(flags.dimensionamento) {
                amz.set.modulo(aux, tipoLista);
                return true;
            }
        }
        return 0;
    }

    function eval_dim(aux) {
        let rule_set = aux.fee.rules_fee.dimensionamento.rule_set;
        for(let i = 0; i < rule_set.length; i++) {
            aux.set.rule(rule_set[i]);
            flags.dimensionamento = aux.eval.dimensionamento.tipo_rule();
            if(!flags.dimensionamento) return false;
            amz.set.inspectedRules(aux, rule_set[i], tipoLista);
        }
        return flags.dimensionamento;
    }

    return {
        calculo: function(produto) {
            return novoTeste(produto);
        }
    }

}]);


