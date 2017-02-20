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
        }
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
        return this.parametros;
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
        nome_fee: 0,
        inspectedRules: [{
            params: {},
            rule_set: []
        }]
    },
    set_nome_fee: function(nome) {
        this.produto.estudo_do_produto.modulo_amazon.categoria = nome;
        this.modulo.nome_fee = nome;
    },
    set_inspectedRules: function(inspectedRulesArray) {
        this.produto.estudo_do_produto.modulo_amazon.inspectedRules = inspectedRulesArray;
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

angular.module('amazonfees').factory('AmazonMod', ['Amazonfees', function(Amazonfees) {

    listaFees = Amazonfees.query();

    function teste(produto) {
        let listaFba = listas.fba();
        amz.set_produto(produto);
        auxParams.setParametros(produto);
        return avaliador.verificaRegras(auxParams.parametros, produto, listaFba);
    }

    function auxCalculoEstoque(produto) {
        let parametros = {};
        let listaMisf = listas.misf();
        auxDeterminaParametros(parametros, produto);
    }

    function auxDeterminaParametros(parametros, produto) {
        auxParams.setParametros(produto);
        parametros.dimensoes = auxParams.parametros.dimensoes;
        parametros.peso = auxParams.parametros.peso;
        // parametros.dimensoes.girth = auxParams.determinaGirth(parametros.dimensoes);
    }

    return {
        calculo: function(produto) {
            return teste(produto);
        }
    }

}]);


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
        case 'shortest side':
            return avaliador.eval_operadores(params.dimensoes.shortest, regra.dados_rule.valor, regra.operador_rule);
        case 'median side':
            return avaliador.eval_operadores(params.dimensoes.median, regra.dados_rule.valor, regra.operador_rule);
        case 'longest side':
            return avaliador.eval_operadores(params.dimensoes.longest, regra.dados_rule.valor, regra.operador_rule);
        case 'longest plus girth':
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
// function evaluate_op(param_1, param_2, operator) {
//     switch (operator) {
//         case 'igual':
//             return (param_1 === param_2);
//         case 'maior':
//             return (param_1 > param_2);
//         case 'menor':
//             return (param_1 < param_2);
//         case 'maior ou igual':
//             return (param_1 >= param_2);
//         case 'menor ou igual':
//             return (param_1 <= param_2);
//         default:
//             return 0;
//     }
// }


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
            // return evaluate_op(params.peso.oz, regra.dados_rule.valor, regra.operador_rule);
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

function determinaSize() {

}


