/**
 * Created by Vittorio on 31/08/2016.
 */
angular.module('produtos').filter('produtosDoEstudoFilter', [function ($filter) {
    return function(inputArray, searchCriteria) {
        if(!angular.isDefined(searchCriteria) || searchCriteria == '') {
            return inputArray;
        }
        var data = [];
        angular.forEach(inputArray, function (item) {
            if (item.produto_ref == searchCriteria) {
                console.log('Caralho');
                data.push(item);
            }
        });
        return data; };
}]);