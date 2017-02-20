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

let tipoSize = '';

let inspectedRules = [];

angular.module('amazonfees').factory('AmazonMod', ['Amazonfees', function(Amazonfees) {

    let listaFees = Amazonfees.query();

    function teste(produto) {
        let parametros = {};
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
            if(listaFees[i].tem_valor_calculado) custo = evaluate_unidade(params, listaFees[i], produto);
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

function evaluate_pesagem(params, fee) {
    let rule_set = fee.rule_set;
    for(let i = 0; i < rule_set.length; i++) {
        flags.pesagem = evaluate(params, rule_set[i], rule_set[i].tipo_rule);
        if(!flags.pesagem) break;
        auxInspectRules(params, rule_set[i]);
    }
    return flags.pesagem;
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

function auxDeterminaValorCalculado(params, fee) {

}

function evaluate_unidade(params, regra, produto) {
    switch (regra.dados_fee.calculado.unidade_franquia) {
        case 'm3':
            return evaluate_op(params.peso.oz, regra.dados_rule.valor, regra.operador_rule);
        case 'lb':
            let base = params.peso.lb - regra.dados_fee.calculado.franquia;
            regra.dados_fee.calculado.resultado = base * regra.dados_fee.calculado.multiplicador;
            return regra.dados_fee.calculado.resultado + regra.dados_fee.valor;
        default:
            return 0;
    }
}

function auxCalculadoByPeso() {

}


