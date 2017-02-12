/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('paises').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('pais_create', {
                url: '/paises/create',
                templateUrl: 'app/paises/view/create-pais.client.view.html',
                controller: 'PaisesController'
            })
            .state('pais_list', {
                url: '/paises',
                templateUrl: 'app/paises/view/list-paises.client.view.html',
                controller: 'PaisesController'
            })
            .state('pais_view', {
                url: '/paises/:paisId',
                templateUrl: 'app/paises/view/view-pais.client.view.html',
                controller: 'PaisesController'
            })
            .state('pais_edit', {
                url: '/paises/:paisId/edit',
                templateUrl: 'app/paises/view/edit-pais.client.view.html',
                controller: 'PaisesController'
            });
    }
]);