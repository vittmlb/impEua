/**
 * Created by Vittorio on 14/02/2017.
 */
angular.module('embalagens').factory('Embalagens', ['$resource', function ($resource) {
    return $resource('api/embalagens/:embalagemId', {
        embalagemId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);