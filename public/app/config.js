/**
 * Created by Vittorio on 01/08/2016.
 */
angular.module('estudos').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/', {
            templateUrl: 'index.html'
        });
        $stateProvider

            // Custos
            .state('custos_create', {
                url: '/custos/create',
                templateUrl: 'app/custos/views/create-custo.client.view.html',
                controller: 'CustosController'
            })
            .state('custos_list', {
                url: '/custos',
                templateUrl: 'app/custos/views/list-custos.client.view.html',
                controller: 'CustosController'
            })
            .state('custos_view', {
                url: '/custos/:custoId',
                templateUrl: 'app/custos/views/view-custo.client.view.html',
                controller: 'CustosController'
            })
            .state('custos_edit', {
                url: '/custos/:custoId/edit',
                templateUrl: 'app/custos/views/edit-custo.client.view.html',
                controller: 'CustosController'
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