/**
 * Created by Vittorio on 15/08/2016.
 */
angular.module('estudos').config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('estudos_main', {
            url: '/estudos',
            templateUrl: 'app/estudos/views/main-estudos.client.view.html',
            controller: 'EstudosController'
        });
}]);