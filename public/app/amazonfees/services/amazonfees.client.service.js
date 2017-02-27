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
    }
};

let flags = {
    vigencia: true,
    intervalo_data: true,
    dimensionamento: false,
    pesagem: false
};

let listaFees = [];

let listas = {
    fba: function() {
        let listaFba = listaFees.filter(function (data) {
            if (data.tipo_fee === 'FBA Fulfillment Fees') {
                return data;
            }
        });
        return listaFba.sort(function (a, b) {
            return (a.precedencia - b.precedencia);
        });
    },
    misf: function() {
        let listaMisf = listaFees.filter(function (data) {
            if (data.tipo_fee === 'FBA Fulfillment Fees') {
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

let auxParams = {
    parametros: {
        dimensoes: {
            longest: -1,
            shortest: -1,
            median: -1,
            girth: -1
        },
        peso: {
            lb: -1,
            oz: -1,
        },
        volume: -1,
        meses: -1,
    },
    produto: {},
    setParametros: function(produto) {
        this.setProduto(produto);
        this.setParametrosProduto(produto);
    },
    setProduto: function(produto) {
        this.produto = produto;
    },
    setParametrosProduto: function(produto) {
        let dim = produto.embalagem.dimensoes;
        let array = [dim.largura, dim.comprimento, dim.altura].sort();
        this.parametros.dimensoes.shortest = this.convMetroToPolegada(array[0]);
        this.parametros.dimensoes.median = this.convMetroToPolegada(array[1]);
        this.parametros.dimensoes.longest = this.convMetroToPolegada(array[2]);
        this.parametros.dimensoes.girth =  2 * (this.parametros.dimensoes.median + this.parametros.dimensoes.shortest); // já está convertido para polegadas.
        this.parametros.peso.lb = this.convKgToLb(produto.embalagem.peso.bruto);
        this.parametros.peso.oz = this.convKgToOz(produto.embalagem.peso.bruto);
        this.parametros.volume = this.calculaVolume(produto);
        this.parametros.meses = produto.estudo_do_produto.venda_media.converte.dia_para_mes();
        return this.parametros;
    },
    calculaEstoqueBaseM3: function() {
        return this.volume * this.produto.estudo_do_produto.qtd;
    },
    calculaVendaMensalM3: function() {
        return this.produto.estudo_do_produto.venda_media.calcula.venda.mensal() * this.parametros.volume;
    },
    calculaVolume: function(produto) {
        let dim = produto.embalagem.dimensoes;
        return (dim.largura * dim.comprimento * dim.altura);
    },
    convKgToOz: function (kg) {
        return kg * 35.274;
    },
    convKgToLb: function (kg) {
        return kg * 2.20462;
    },
    convMetroToPolegada: function(m) {
        return m * 39.3701;
    }
};


let amz = {
    produto: {},
    modulo: {
        fba: {
            fulfillment: 0,
            inventory: 0,
            placement: 0
        },
        comissoes: 0,
        categoria: '',
        nome_fee: 0,
        inspectedRules: [{
            params: {},
            rule_set: []
        }]
    },
    set_modulo: function(mod) {
        this.modulo = mod;
    },
    set_nome_fee: function(nome) {
        this.produto.estudo_do_produto.modulos.amazon.categoria = nome;
        this.modulo.nome_fee = nome;
    },
    set_inspectedRules: function(inspectedRulesArray) {
        this.produto.estudo_do_produto.modulos.amazon.inspectedRules = inspectedRulesArray;
        this.modulo.inspectedRules = inspectedRulesArray;
    },
    set_produto: function(produto) {
        this.produto = produto;
    },
    unset_inspectedRules: function() {
        this.modulo.inspectedRules = [{
            params: {},
            rule_set: []
        }]
    }
};

let avaliador = {
    inspectedRules: [],
    currentFee: {},
    currentRule: {},
    currentRuleSet: {},
    verificaRegras: function(params, produto, listaFees) {
        let custo = 0;
        for(let i = 0; i < listaFees.length; i++) {
            custo = listaFees[i].dados_fee.valor;
            if(!evaluate_dimensionamento(params, listaFees[i].rules_fee.dimensionamento)) {
                this.unset_inspectedRules();
                continue;
            }

            if(!evaluate_pesagem(params, listaFees[i].rules_fee.pesagem)) {
                this.unset_inspectedRules();
                continue;
            }

            if(checkFlags()) {
                // amz.set.inspectedRules(auxParams.inspectedRules); // todo: Encontrar uma forma de jogar esse array para o objeto amazon.
                amz.set_nome_fee(listaFees[i].nome_fee);
                if(listaFees[i].tem_valor_calculado) custo = evaluate_unidade(params, listaFees[i], produto);
                return custo;
            }
        }
        return 0;
    },
    verificaRegrasInventory: function(produto) {
        let custo = 0;
        let lista = listas.misf();
        for(let i = 0; i < lista.length; i++) {
            custo = lista[i].dados_fee.valor;
            if(!evaluate_dimensionamento(auxParams, lista[i].rules_fee.dimensionamento)) {
                this.unset_inspectedRules();
                continue;
            }

            if(flags.dimensionamento) {
                amz.set_nome_fee(lista[i].nome_fee);
                if(lista[i].tem_valor_calculado) custo = evaluate_unidade(params, lista[i], produto);
                return custo;
            }
        }
        return 0;
    },
    unset_inspectedRules: function() {
        this.inspectedRules = [];
    },
    eval_operadores: function(param_1, param_2, operator) {
        switch (operator) {
            case 'igual':
                return (param_1 === param_2);
            case 'maior':
                return (param_1 > param_2);
            case 'menor':
                return (param_1 < param_2);
            case 'maior ou igual':
                return (param_1 >= param_2);
            case 'menor ou igual':
                return (param_1 <= param_2);
            default:
                return 0;
        }
    }
};

angular.module('amazonfees').factory('CompAmazon', ['Amazonfees', function(Amazonfees) {

    listaFees = Amazonfees.query();

    function teste(produto) {
        let listaFba = listas.fba();
        amz.set_produto(produto);
        auxParams.setParametros(produto);
        amz.modulo.fba.fulfillment = avaliador.verificaRegras(auxParams.parametros, produto, listaFba);
        amz.modulo.fba.inventory = avaliador.verificaRegrasInventory(produto);
        amz.modulo.categoria = amz.modulo.nome_fee;
        return amz.modulo;
    }

    function novoTeste(produto) {
        let listaFba = listas.fba();
        amz.set_produto(produto);
        my_eval(produto);
        return amz.modulo;
    }

    function auxCalculoEstoque(produto) {
        amz.set_produto(produto);
        auxParams.setParametros(produto);
        let parametros = {};
        let listaMisf = listas.misf();
    }

    function auxDeterminaParametros(parametros, produto) {
        auxParams.setParametros(produto);
        parametros.dimensoes = auxParams.parametros.dimensoes;
        parametros.peso = auxParams.parametros.peso;
        // parametros.dimensoes.girth = auxParams.determinaGirth(parametros.dimensoes);
    }

    return {
        calculo: function(produto) {
            return novoTeste(produto);
        }
    }

}]);

function my_eval(produto) {
    let lista = listas.fba();
    let custo = 0;
    let aux = new RuleAux();
    aux.set.produto(produto);
    aux.set.parametros();
    for(let i = 0; i < lista.length; i++) {
        custo = lista[i].dados_fee.valor;
        aux.set.fee(lista[i]);
        if(!eval_dim(aux, lista[i])) {
            // this.unset_inspectedRules();
            continue;
        }

        if(flags.dimensionamento) {
            // amz.set.inspectedRules(auxParams.inspectedRules); // todo: Encontrar uma forma de jogar esse array para o objeto amazon.
            amz.modulo.fba.fulfillment = aux.calcula.fulfillment.total();
            // amz.modulo.fba.inventory = avaliador.verificaRegrasInventory(produto);
            amz.modulo.categoria = amz.modulo.nome_fee;
            // if(listaFees[i].tem_valor_calculado) custo = aux.calcula.fulfillment.total();
            return custo;
        }
    }
    return 0;
}

function eval_dim(aux, fee) {
    let rule_set = aux.fee.rules_fee.dimensionamento.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        aux.set.rule(rule_set[i]);
        flags.dimensionamento = aux.eval.dimensionamento.tipo_rule();
        if(!flags.dimensionamento) return false;
        amz.modulo.inspectedRules.push({"params": aux.parametros, "rule_set": rule_set[i]});
    }
    return flags.dimensionamento;
}

function evaluate_dimensionamento(params, fee) {
    let rule_set = fee.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        flags.dimensionamento = evaluate(params, rule_set[i], rule_set[i].tipo_rule);
        if(!flags.dimensionamento) return false;
        amz.modulo.inspectedRules.push({"params": params, "rule_set": rule_set[i]});
    }
    return flags.dimensionamento;
}
function evaluate_medida(params, regra) {
    switch (regra.params_rule.lados) {
        case opt.shortest:
            return avaliador.eval_operadores(params.dimensoes.shortest, regra.dados_rule.valor, regra.operador_rule);
        case opt.median:
            return avaliador.eval_operadores(params.dimensoes.median, regra.dados_rule.valor, regra.operador_rule);
        case opt.longest:
            return avaliador.eval_operadores(params.dimensoes.longest, regra.dados_rule.valor, regra.operador_rule);
        case opt.girth:
            return avaliador.eval_operadores((params.dimensoes.longest + params.dimensoes.girth), regra.dados_rule.valor, regra.operador_rule);
        default:
            return 0;
    }
}

function evaluate_pesagem(params, fee) {
    let rule_set = fee.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        flags.pesagem = evaluate(params, rule_set[i], rule_set[i].tipo_rule);
        if(!checkFlags()) break;
        amz.modulo.inspectedRules.push({"params": params, "rule_set": rule_set[i]});
    }
    return flags.pesagem;
}
function evaluate_peso(params, regra) {
    switch (regra.dados_rule.unidade) {
        case 'oz':
            return avaliador.eval_operadores(params.peso.oz, regra.dados_rule.valor, regra.operador_rule);
        case 'lb':
            return avaliador.eval_operadores(params.peso.lb, regra.dados_rule.valor, regra.operador_rule);
        default:
            return 0;
    }
}

function evaluate(params, regra, tipo_rule) {
    switch (tipo_rule) {
        case 'peso':
            return evaluate_peso(params, regra);
        case 'medida':
            return evaluate_medida(params, regra);
        default:
            return false;
    }
}


// function auxInspectRules (params, rule_set) {
//     let auxString = '';
//     let inspectedRule = {};
//     inspectedRule.params = params;
//     inspectedRule.rule_set = rule_set;
//     amz.modulo.inspectedRules.push({"params": params, "rule_set": rule_set});
//     inspectedRules.push(inspectedRule);
// }


function evaluate_unidade(params, regra, produto) {
    switch (regra.dados_fee.calculado.unidade_franquia) {
        case 'm3':
            return calcula_custo_inventorio(regra);
        case 'lb':
            let base = params.peso.lb - regra.dados_fee.calculado.franquia;
            regra.dados_fee.calculado.resultado = base * regra.dados_fee.calculado.multiplicador;
            return regra.dados_fee.calculado.resultado + regra.dados_fee.valor;
        default:
            return 0;
    }
}

function checkFlags() {
    return flags.dimensionamento == true && flags.intervalo_data == true && flags.pesagem == true && flags.vigencia == true;
}

function calcula_custo_inventorio(regra) {
    let estoque = auxParams.calculaEstoqueBaseM3();
    let venda_mensal = auxParams.calculaVendaMensalM3();
    let custo = 0;
    while(estoque > 0) {
        custo += (estoque * regra.dados_fee.valor);
        estoque = estoque - venda_mensal;
    }
    return custo;
}


