/**
 * Created by Vittorio on 28/02/2017.
 */
angular.module('despesas').factory('Despesas', ['$resource', function ($resource) {
    return $resource('/api/despesas/:despesaId', {
        despesaId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);