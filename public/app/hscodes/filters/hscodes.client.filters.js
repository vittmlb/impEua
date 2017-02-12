/**
 * Created by Vittorio on 04/08/2016.
 */
angular.module('despesas').filter('percentage', ['$filter', function ($filter) {
    return function(input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}]);