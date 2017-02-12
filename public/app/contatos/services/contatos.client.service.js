/**
 * Created by Vittorio on 01/09/2016.
 */
angular.module('contatos').factory('Contatos', ['$resource', function ($resource) {
    return $resource('/api/contatos/:contatoId', {
        contatoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);