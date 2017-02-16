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
        let fees = Amazonfees.query();
        let reg = Amazonfees.get({
            amazonfeeId: '58a586eec341f3b43708ce74'
        });
        let teste = 'Caralho';

        function analisaRegra(produto) {
            let a = evaluate(produto.medidas.peso, reg.regras[0].dados.valor, reg.regras[0].operador);
            if(a) {
                return 999;
            } else {
                return 2;
            }
        }

        return {
            resp: teste,
            fee: 'alow',
            saco: reg,
            testaRegra: function(produto) {
                return analisaRegra(produto);
            }
        }

    }
]);

function evaluate(param_1, param_2, operator) {
    switch (operator) {
        case 'menor ou igual':
            return (param_1 <= param_2);
    }
}

