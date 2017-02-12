/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('estados').controller('EstadosController', ['$scope', '$stateParams', '$location', 'Estados', 'Paises', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Estados, Paises, toaster, SweetAlert) {
        var SweetAlertOptions = {
            removerEstado: {
                title: "Deseja remover o Estado?",
                text: "Você não poderá mais recuperá-lo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $scope.ListaPaises = Paises.query();
        $scope.create = function() {
            var estado = new Estados({
                nome_estado: this.nome_estado,
                sigla_estado: this.sigla_estado,
                pais_estado: this.pais_estado
            });
            estado.$save(function (response) {
                $location.path('/estados/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse.data.message,
                    timeout: 4000
                });
            });
        };
        $scope.find = function() {
            $scope.estados = Estados.query();
        };
        $scope.findOne = function() {
            $scope.estado = Estados.get({
                estadoId: $stateParams.estadoId
            });
        };
        $scope.update = function() {
            $scope.estado.$update(function (response) {
                $location.path('/estados/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse.data.message,
                    timeout: 4000
                });
            });
        };
        $scope.delete = function(estado) {
            if(estado) {
                estado.$remove(function () {
                    for (var i in $scope.estados) {
                        if ($scope.estados[i] === estado) {
                            $scope.estados.splice(i, 1);
                        }
                    }
                }, function (errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data.message,
                        timeout: 4000
                    });
                });
            } else {
                $scope.estado.$remove(function () {
                    $location.path('/estados');
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

        $scope.deleteAlert = function(estado) {
            SweetAlert.swal(SweetAlertOptions.removerEstado,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(estado);
                        SweetAlert.swal("Removido!", "O Estado foi removido.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "O Estado não foi removido :)", "error");
                    }
                });
        };
    }
]);