/**
 * Created by Vittorio on 01/09/2016.
 */
angular.module('contatos').config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('contato_create', {
            url: '/contatos/create',
            templateUrl: 'app/contatos/views/create-contato.client.view.html',
            controller: 'ContatosController'
        })
        .state('contato_list', {
            url: '/contatos',
            templateUrl: 'app/contatos/views/list-contatos.client.view.html',
            controller: 'ContatosController'
        })
        .state('contato_view', {
            url: '/contatos/:contatoId',
            templateUrl: 'app/contatos/views/view-contato.client.view.html',
            controller: 'ContatosController'
        })
        .state('contato_edit', {
            url: '/contatos/:contatoId/edit',
            templateUrl: 'app/contatos/views/edit-contato.client.view.html',
            controller: 'ContatosController'
        });
}]);