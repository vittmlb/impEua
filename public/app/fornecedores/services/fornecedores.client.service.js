/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('fornecedores').factory('Fornecedores', ['$resource', function ($resource) {
    return $resource('/api/fornecedores/:fornecedorId', {
        fornecedorId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);