/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonrules').factory('Amazonrules', ['$resource', function ($resource) {
    return $resource('/api/amazonrules/:amazonruleId', {
        amazonruleId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
angular.module('amazonrules').factory('AmazonrulesQueries', ['$resource', function ($resource) {

    return $resource('/api/amazonrules/query/:tiposetId', {
        tiposetId: '@_id'
    }, {
        query: {
            method: 'GET',
            // isArray: true,
            params: {tiposetId: this.tiposetId}
        }
    });

}]);

// angular.module('amazonrules').factory('AmazonrulesQueries', ['$resource', function ($resource) {
//
//     // let teste = this.tiposetId;
//
//     this.alow = '';
//     this.saco = '';
//
//     let api = function() {
//         return $resource('/api/amazonrules/:amazonruleId', {
//             amazonruleId: '@_id'
//         }, {
//             update: {
//                 method: 'PUT'
//             }
//         });
//     };
//     let abi = function() {
//         return $resource('/api/amazonrules/query/:tiposetId', {
//             tiposetId: '@_id'
//         }, {
//             query: {
//                 method: 'GET',
//                 isArray: true,
//                 params: {tiposetId: this.tiposetId}
//             }
//         });
//     };
//
//     return {
//         a: api(),
//         b: abi()
//     }
//
// }]);


