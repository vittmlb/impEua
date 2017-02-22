/**
 * Created by Vittorio on 01/06/2016.
 */
angular.module('custos').factory('Custos', ['$resource', function ($resource) {
    return $resource('/api/custos/:custoId', {
        custoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    })
}]);