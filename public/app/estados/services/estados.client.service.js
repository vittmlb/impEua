/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('estados').factory('Estados', ['$resource', function ($resource) {
    return $resource('/api/estados/:estadoId', {
        estadoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);