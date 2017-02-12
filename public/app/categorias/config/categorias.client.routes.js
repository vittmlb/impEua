/**
 * Created by Vittorio on 02/09/2016.
 */
angular.module('categorias').config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('categoria_create', {
            url: '/categorias/create',
            templateUrl: 'app/categorias/views/create-categoria.client.view.html',
            controller: 'CategoriasController'
        })
        .state('categoria_list', {
            url: '/categorias',
            templateUrl: 'app/categorias/views/list-categorias.client.view.html',
            controller: 'CategoriasController'
        })
        .state('categoria_view', {
            url: '/categorias/:categoriaId',
            templateUrl: 'app/categorias/views/view-categoria.client.view.html',
            controller: 'CategoriasController'
        })
        .state('categoria_edit', {
            url: '/categorias/:categoriaId/edit',
            templateUrl: 'app/categorias/views/edit-categoria.client.view.html',
            controller: 'CategoriasController'
        });
}]);
