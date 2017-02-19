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

function convKgToOz(kg) {
    return kg * 35.274;
}
function convKgToLb(kg) {
    return kg * 2.20462;
}
function convMetroToPolegada(m) {
    return m * 39.3701;
}
function calculaGirth(dimensoes) {
    return 2 * (dimensoes.median + dimensoes.shortest); // já está convertido para polegadas.
}

let flags = {
    vigencia: true,
    intervalo_data: true,
    dimensionamento: false,
    pesagem: false
};

let inspectedRules = [];

angular.module('amazonfees').factory('AmazonMod', ['Amazonfees', function(Amazonfees) {

    let listaFees = Amazonfees.query();

    function teste(produto) {
        let parametros = {};
        if(listaFees[0].nome_fee === 'A1') {
            produto.custo_usd = 999;
        }
        parametros.dimensoes = determinaLados(produto);
        parametros.peso = determinaPeso(produto);
        parametros.dimensoes.girth = determinaGirth(parametros.dimensoes);
        return verificaRegras(parametros, produto, listaFees);
    }


    return {
        calculo: function(produto) {
            return teste(produto);
        }
    }

}]);

function determinaLados(produto) {
    let dim = produto.embalagem.dimensoes;
    let array = [dim.largura, dim.comprimento, dim.altura].sort();
    return {
        shortest: convMetroToPolegada(array[0]),
        median: convMetroToPolegada(array[1]),
        longest: convMetroToPolegada(array[2])
    };

}
function determinaPeso(produto) {
    return {"lb": convKgToLb(produto.embalagem.peso.bruto), "oz": convKgToOz(produto.embalagem.peso.bruto)};
}
function determinaGirth(dimensoes) {
    return calculaGirth(dimensoes)
}

function verificaRegrasOld(params, produto, listaFees) {
    let custo = 0;
    let flag_dimensionamento = 1;
    let flag_pesagem = 1;
    for(let i = 0; i < listaFees.length; i++) {
        custo = listaFees[i].dados_fee.valor;
        let rules_fee = listaFees[i].rules_fee;
        for(let j = 0; j < rules_fee.dimensionamento.rule_set.length; j++) {
            flag_dimensionamento = evaluate(params, rules_fee.dimensionamento.rule_set[j], rules_fee.dimensionamento.rule_set[j].tipo_rule)
            if(!flag_dimensionamento) break;
        }
        if(!flag_dimensionamento) continue;
        for(let h = 0; h < rules_fee.pesagem.rule_set.length; h++) {
            if(!evaluate(params, rules_fee.pesagem.rule_set[h], rules_fee.pesagem.rule_set[h].tipo_rule)) {
                flag_pesagem = 0;
                break;
            }
        }
        if(flag_dimensionamento == true && flag_pesagem == true) {
            produto.estudo_do_produto.modulo_amazon.categoria = listaFees[i].nome_fee;
            return custo;
        }
    }
    return 0;
}

function verificaRegras(params, produto, listaFees) {
    let custo = 0;
    for(let i = 0; i < listaFees.length; i++) {
        custo = listaFees[i].dados_fee.valor;
        if(!evaluate_dimensionamento(params, listaFees[i].rules_fee.dimensionamento)) {
            inspectedRules = [];
            continue;
        }
        if(!evaluate_pesagem(params, listaFees[i].rules_fee.pesagem)) {
            inspectedRules = [];
            continue;
        }
        if(checkFlags()) {
            produto.estudo_do_produto.modulo_amazon.categoria = listaFees[i].nome_fee;
            produto.estudo_do_produto.modulo_amazon.inspectedRules = inspectedRules;
            return custo;
        }
    }
    return 0;
}

function evaluate_dimensionamento(params, fee) {
    let rule_set = fee.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        flags.dimensionamento = evaluate(params, rule_set[i], rule_set[i].tipo_rule);
        if(!flags.dimensionamento) return false;
        auxInspectRules(params, rule_set[i]);
    }
    return flags.dimensionamento;
}
function evaluate_pesagem(params, fee) {
    let rule_set = fee.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        flags.pesagem = evaluate(params, rule_set[i], rule_set[i].tipo_rule);
        if(!flags.pesagem) break;
        auxInspectRules(params, rule_set[i]);
    }
    return flags.pesagem;
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

function evaluate_medida(params, regra) {
    switch (regra.params_rule.lados) {
        case 'shortest side':
            return evaluate_op(params.dimensoes.shortest, regra.dados_rule.valor, regra.operador_rule);
        case 'median side':
            return evaluate_op(params.dimensoes.median, regra.dados_rule.valor, regra.operador_rule);
        case 'longest side':
            return evaluate_op(params.dimensoes.longest, regra.dados_rule.valor, regra.operador_rule);
        case 'longest plus girth':
            return evaluate_op((params.dimensoes.longest + params.dimensoes.girth), regra.dados_rule.valor, regra.operador_rule);
        default:
            return 0;
    }
}

function evaluate_peso(params, regra) {
    switch (regra.dados_rule.unidade) {
        case 'oz':
            return evaluate_op(params.peso.oz, regra.dados_rule.valor, regra.operador_rule);
        case 'lb':
            return evaluate_op(params.peso.lb, regra.dados_rule.valor, regra.operador_rule);
        default:
            return 0;
    }
}

function evaluate_op(param_1, param_2, operator) {
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

function checkFlags() {
    return flags.dimensionamento == true && flags.intervalo_data == true && flags.pesagem == true && flags.vigencia == true;
}

function auxInspectRules (params, rule_set) {
    let auxString = '';
    let inspectedRule = {};
    inspectedRule.params = params;
    inspectedRule.rule_set = rule_set;
    inspectedRules.push(inspectedRule);
}


