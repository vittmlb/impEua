/**
 * Created by Vittorio on 02/08/2016.
 */
angular.module('estudos').filter('percent', ['$filter', function ($filter) {
    return function(input, decimals) {
        return $filter('number')(input , decimals) + '%';
    };
}]);