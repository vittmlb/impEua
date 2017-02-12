/**
 * Created by Vittorio on 02/09/2016.
 */
angular.module('categorias').factory('Categorias', ['$resource', function ($resource) {
    return $resource('/api/categorias/:categoriaId', {
        categoriaId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);