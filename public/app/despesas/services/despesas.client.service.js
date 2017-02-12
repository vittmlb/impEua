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