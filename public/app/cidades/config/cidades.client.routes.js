/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('cidades').config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('cidade_create', {
            url: '/cidades/create',
            templateUrl: 'app/cidades/views/create-cidade.client.view.html',
            controller: 'CidadesController'
        })
        .state('cidade_list', {
            url: '/cidades',
            templateUrl: 'app/cidades/views/list-cidades.client.view.html',
            controller: 'CidadesController'
        })
        .state('cidades_view', {
            url: '/cidades/:cidadeId',
            templateUrl: 'app/cidades/views/view-cidade.client.view.html',
            controller: 'CidadesController'
        })
        .state('cidades_edit', {
            url: '/cidades/:cidadeId/edit',
            templateUrl: 'app/cidades/views/edit-cidade.client.view.html',
            controller: 'CidadesController'
        });
}]);