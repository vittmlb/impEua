/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('cidades').factory('Cidades', ['$resource', function ($resource) {
    return $resource('/api/cidades/:cidadeId', {
        cidadeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);