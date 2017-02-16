/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonfees').factory('Amazonfees', ['$resource', function ($resource) {
    return $resource('/api/amazonfees/:amazonfeeId', {
        amazonfeeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

angular.module('amazonfees').factory('Amazonrules', ['$scope', 'Amazonfees',
    function($scope, Amazonfees) {
        let fees = Amazonfees.query();
        let teste = 'Caralho';

        return {
            resp: teste
        }

    }
]);