/**
 * Created by Vittorio on 01/08/2016.
 */
angular.module('estudos').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/', {
            templateUrl: 'index.html'
        });
        $stateProvider

            // Despesas
            .state('despesas_create', {
                url: '/despesas/create',
                templateUrl: 'app/despesas/views/create-despesa.client.view.html',
                controller: 'DespesasController'
            })
            .state('despesas_list', {
                url: '/despesas',
                templateUrl: 'app/despesas/views/list-despesas.client.view.html',
                controller: 'DespesasController'
            })
            .state('despesas_view', {
                url: '/despesas/:despesaId',
                templateUrl: 'app/despesas/views/view-despesa.client.view.html',
                controller: 'DespesasController'
            })
            .state('despesas_edit', {
                url: '/despesas/:despesaId/edit',
                templateUrl: 'app/despesas/views/edit-despesa.client.view.html',
                controller: 'DespesasController'
            })

            // Produtos
            .state('produto_create', {
                url: '/produtos/create',
                templateUrl: 'app/produtos/views/create-produto.client.view.html',
                controller: 'ProdutosController'
            })
            .state('produto_list', {
                url: '/produtos',
                templateUrl: 'app/produtos/views/list-produtos.client.view.html',
                controller: 'ProdutosController'
            })
            .state('produto_view', {
                url: '/produtos/:produtoId',
                templateUrl: 'app/produtos/views/view-produto.client.view.html',
                controller: 'ProdutosController'
            })
            .state('produto_edit', {
                url: '/produtos/:produtoId/edit',
                templateUrl: 'app/produtos/views/edit-produto.client.view.html'
            });

            // Estudos


    }
]);