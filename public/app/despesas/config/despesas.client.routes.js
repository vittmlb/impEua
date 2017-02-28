/**
 * Created by Vittorio on 28/02/2017.
 */
angular.module('despesas').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('despesa_create', {
            url: '/despesas/create',
            templateUrl: 'app/despesas/views/create-despesa.client.view.html',
            controller: 'DespesasController'
        })
        .state('despesa_list', {
            url: '/despesas',
            templateUrl: 'app/despesas/views/list-despesas.client.view.html',
            controller: 'DespesasController'
        })
        .state('despesa_view', {
            url: '/despesas/:despesaId',
            templateUrl: 'app/despesas/views/view-despesa.client.view.html',
            controller: 'DespesasController'
        })
        .state('despesa_edit', {
            url: '/despesas/:despesaId/edit',
            templateUrl: 'app/despesas/views/edit-despesa.client.view.html',
            controller: 'DespesasController'
        });
}]);