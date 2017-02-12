/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('fornecedores').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('fornecedor_create', {
                url: '/fornecedores/create',
                templateUrl: 'app/fornecedores/views/create-fornecedor.client.view.html',
                controller: 'FornecedoresController'
            })
            .state('fornecedor_list', {
                url: '/fornecedores',
                templateUrl: 'app/fornecedores/views/list-fornecedores.client.view.html',
                controller: 'FornecedoresController'
            })
            .state('fornecedor_view', {
                url: '/fornecedores/:fornecedorId',
                templateUrl: 'app/fornecedores/views/view-fornecedor.client.view.html',
                controller: 'FornecedoresController'
            })
            .state('fornecedor_edit', {
                url: '/fornecedores/:fornecedorId/edit',
                templateUrl: 'app/fornecedores/views/edit-fornecedor.client.view.html',
                controller: 'FornecedoresController'
            });
    }
]);
