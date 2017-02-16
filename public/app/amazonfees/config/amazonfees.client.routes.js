/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonfees').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('amazonfee_create', {
            url: '/amazonfees/create',
            templateUrl: 'app/amazonfees/views/create-amazonfee.client.view.html',
            controller: 'AmazonfeesController'
        })
        .state('amazonfees_list', {
            url: '/amazonfees',
            templateUrl: 'app/amazonfees/views/list-amazonfees.client.view.html',
            controller: 'AmazonfeesController'
        })
        .state('amazonfee_view', {
            url: '/amazonfees/:amazonfeeId',
            templateUrl: 'app/amazonfees/views/view-amazonfees.client.view.html',
            controller: 'AmazonfeesController'
        })
        .state('amazonfee_edit', {
            url: '/amazonfees/:amazonfeeId/edit',
            templateUrl: 'app/amazonfees/views/edit-amazonfees.client.view.html',
            controller: 'AmazonfeesController'
        });
}]);