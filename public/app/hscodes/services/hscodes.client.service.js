/**
 * Created by Vittorio on 04/08/2016.
 */
angular.module('hs').factory('Hscodes', ['$resource', function ($resource) {
    return $resource('/api/hscode/:hsId', {
        hsId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);