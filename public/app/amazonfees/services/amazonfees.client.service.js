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

angular.module('amazonfees').factory('Amazonrules', ['Amazonfees',
    function(Amazonfees) {
        let reg = Amazonfees.get({
            amazonfeeId: '58a63e2c9f4c66905ca471e8'
        });

        function analisaRegra(produto) {
            let valor = 0;
            let regras = reg.criterios_size.regras;
            for(let i = 0; i < regras.length; i++) {
                let flag = evaluate_tipo(regras[i], produto);
                if(!flag) {
                    valor = 0;
                    break;
                } else {
                    valor = 999;
                }
            }
            return valor;
        }

        return {
            testaRegra: function(produto) {
                return analisaRegra(produto);
            }
        }

    }
]);

function evaluate_tipo(regra, produto) {
    switch (regra.tipo_dimensao) {
        case 'peso':
            return evaluate(produto.medidas.peso, regra.dados.valor, regra.operador);
        case 'medida':
            return evaluate(4, regra.dados.valor, regra.operador);
        default:
            return false;
    }
}

function evaluate(param_1, param_2, operator) {
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
    }
}

