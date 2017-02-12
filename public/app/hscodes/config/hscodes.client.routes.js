/**
 * Created by Vittorio on 04/08/2016.
 */
angular.module('hs').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('hs_create', {
                url: '/hscode/create',
                templateUrl: 'app/hscodes/views/create-hs.client.view.html',
                controller: 'HscodeController'
            })
            .state('hs_list', {
                url: '/hscode',
                templateUrl: 'app/hscodes/views/list-hscodes.client.view.html',
                controller: 'HscodeController'
            })
            .state('hs_view', {
                url: '/hscode/:hsId',
                templateUrl: 'app/hscodes/views/view-hs.client.view.html',
                controller: 'HscodeController'
            })
            .state('hs_edit', {
                url: '/hscode/:hsId/edit',
                templateUrl: 'app/hscodes/views/edit-hs.client.view.html',
                controller: 'HscodeController'
            });
    }
]);