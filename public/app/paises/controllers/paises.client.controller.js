/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('paises').controller('PaisesController', ['$scope', '$stateParams', '$location', 'Paises', '$http', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Paises, $http, toaster, SweetAlert) {
        var SweetAlertOptions = {
            removerPais: {
                title: "Deseja remover o País?",
                text: "Você não poderá mais recuperá-lo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $http.get('/app/data/flags.json').success(function (data) {
            $scope.flags = data;
        });
        $scope.create = function() {
            var pais = new Paises({
                nome_pais: this.nome_pais,
                sigla_pais: this.sigla_pais,
                nome_pais_en: this.nome_pais_en
            });
            pais.$save(function (response) {
                $location.path('/paises/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse.data.message; // todo: O que fazer com esse .data.message?
            });
        };
        $scope.find = function() {
            $scope.paises = Paises.query();
        };
        $scope.findOne = function() {
            $scope.pais = Paises.get({
                paisId: $stateParams.paisId
            });
        };
        $scope.update = function() {
            $scope.pais.$update(function (response) {
                $location.path('/paises/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse.data.message; // todo: .data.message??
            });
        };
        $scope.delete = function(pais) {
            if(pais) {
                pais.$remove(function () {
                    for(var i in $scope.paises) {
                        if($scope.paises[i] === pais) {
                            $scope.paises.splice(i, 1);
                        }
                    }
                }, function(errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data.message,
                        timeout: 4000
                    });
                });
            } else {
                $scope.pais.$remove(function () {
                    $location.path('/paises');
                }, function(errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data.message,
                        timeout: 4000
                    });
                });
            }
        };

        $scope.deleteAlert = function(pais) {
            SweetAlert.swal(SweetAlertOptions.removerPais,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(pais);
                        SweetAlert.swal("Removido!", "O País foi removido.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "O País não foi removido :)", "error");
                    }
                });
        };
    }
]);