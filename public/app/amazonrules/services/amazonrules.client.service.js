/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonrules').factory('Amazonrules', ['$resource', function ($resource) {
    return $resource('/api/amazonrules/:amazonruleId', {
        amazonfeeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

