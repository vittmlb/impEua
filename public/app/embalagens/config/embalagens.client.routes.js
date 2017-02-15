/**
 * Created by Vittorio on 14/02/2017.
 */
angular.module('embalagens').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('embalagem_create', {
            url: '/embalagens/create',
            templateUrl: 'app/embalagens/views/create-embalagem.client.view.html',
            controller: 'EmbalagensController'
        })
        .state('embalagem_list', {
            url: '/embalagens',
            templateUrl: 'app/embalagens/views/list-embalagens.client.view.html',
            controller: 'EmbalagensController'
        })
        .state('embalagem_view', {
            url: '/embalagens/:embalagemId',
            templateUrl: 'app/embalagens/views/view-embalagem.client.view.html',
            controller: 'EmbalagensController'
        })
        .state('embalagem_edit', {
            url: '/embalagens/:embalagemId/edit',
            templateUrl: 'app/embalagens/views/edit-embalagem.client.view.html',
            controller: 'EmbalagensController'
        });
}]);