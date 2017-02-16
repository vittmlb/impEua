/**
 * Created by Vittorio on 30/05/2016.
 */

let mainAppModuleName = 'admin_panel';
let mainAppModule = angular.module('admin_panel', [
    'ngResource',
    'ngRoute',
    'produtos',
    'despesas',
    'embalagens',
    'estudos',
    'despesas',
    'hs',
    'fornecedores',
    'paises',
    'estados',
    'cidades',
    'contatos',
    'categorias',
    'amazonfees',
    'toaster',
    'ui.router',
    'ngAnimate',
    'ui.bootstrap',
    'ngFileUpload',
    'oitozero.ngSweetAlert'
]);
//todo: Ver se dá pra tirar o ui.router daí.

mainAppModule.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

if(window.location.hash === '#_=_') window.location.hash = '#!';

angular.element(document).ready(function () {
    angular.bootstrap(document, [mainAppModuleName]);
});

