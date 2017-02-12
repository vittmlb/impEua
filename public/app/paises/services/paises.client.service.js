/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('paises').factory('Paises', ['$resource', function ($resource) {
    return $resource('/api/paises/:paisId', {
        paisId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);