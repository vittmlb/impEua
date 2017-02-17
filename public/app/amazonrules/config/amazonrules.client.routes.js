/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonrules').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('amazonrule_create', {
            url: '/amazonrules/create',
            templateUrl: 'app/amazonrules/views/create-amazonrule.client.view.html',
            controller: 'AmazonrulesController'
        })
        .state('amazonrules_list', {
            url: '/amazonrules',
            templateUrl: 'app/amazonrules/views/list-amazonrules.client.view.html',
            controller: 'AmazonrulesController'
        })
        .state('amazonrule_view', {
            url: '/amazonrules/:amazonruleId',
            templateUrl: 'app/amazonrules/views/view-amazonrule.client.view.html',
            controller: 'AmazonrulesController'
        })
        .state('amazonrule_edit', {
            url: '/amazonrules/:amazonruleId/edit',
            templateUrl: 'app/amazonrules/views/edit-amazonrule.client.view.html',
            controller: 'AmazonrulesController'
        });
}]);