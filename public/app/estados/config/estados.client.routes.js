/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('estados').config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('estado_create', {
            url: '/estados/create',
            templateUrl: 'app/estados/views/create-estado.client.view.html',
            controller: 'EstadosController'
        })
        .state('estado_list', {
            url: '/estados',
            templateUrl: 'app/estados/views/list-estados.client.view.html',
            controller: 'EstadosController'
        })
        .state('estado_view', {
            url: '/estados/:estadoId',
            templateUrl: 'app/estados/views/view-estado.client.view.html',
            controller: 'EstadosController'
        })
        .state('estado_edit', {
            url: '/estados/:estadoId/edit',
            templateUrl: 'app/estados/views/edit-estado.client.view.html',
            controller: 'EstadosController'
        });
}]);
