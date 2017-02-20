/**
 * Created by Vittorio on 01/06/2016.
 */
angular.module('despesas').factory('Despesas', ['$resource', function ($resource) {
    return $resource('/api/despesas/:despesaId', {
        despesaId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    })
}]);
angular.module('despesas').factory('CompDespesas', ['Despesas', function (Despesas) {
    let listaDespesas = Despesas.query();
    let estudo = {};
    let modulo_estudo = {};

    function zera_modulo_estudo() {
        modulo_estudo = {
            aduaneiras: [],
            total: 0
        };
    }


    return {
        ModuloEstudo: function() {
            zera_modulo_estudo();
            listaDespesas.forEach(function (item) {
                if(item.tipo === 'Valor' && item.ativa === true) {
                    modulo_estudo.aduaneiras.push({
                        nome: item.nome,
                        valor: item.valor
                    });
                    modulo_estudo.total += item.valor;
                }
            });
            return modulo_estudo;
        }
    };
}]);