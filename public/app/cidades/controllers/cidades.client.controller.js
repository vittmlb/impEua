/**
 * Created by Vittorio on 14/08/2016.
 */
angular.module('cidades').controller('CidadesController', ['$scope', '$stateParams', '$location', 'Cidades', 'Estados', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Cidades, Estados, toaster, SweetAlert) {
        var SweetAlertOptions = {
            removerCidade: {
                title: "Deseja remover a Cidade?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $scope.ListaEstados = Estados.query();
        $scope.create = function() {
            var cidade = new Cidades({
                nome_cidade: this.nome_cidade,
                estado_cidade: this.estado_cidade
            });
            cidade.$save(function (response) {
                $location.path('/cidades/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse.data.message;
            });
        };
        $scope.find = function() {
            $scope.cidades = Cidades.query();
        };
        $scope.findOne = function() {
            Cidades.get({
                cidadeId: $stateParams.cidadeId
            }).$promise.then(function(data) {
                $scope.cidade = data;
            });
        };
        $scope.update = function() {
            $scope.cidade.$update(function (response) {
                $location.path('/cidades/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse.data.message;
            });
        };
        $scope.delete = function(cidade) {
            if(cidade) {
                cidade.$remove(function () {
                    for(var i in $scope.cidades) {
                        if($scope.cidades[i] === cidade) {
                            $scope.cidades.splice(i, 1);
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
                $scope.cidade.$remove(function () {
                    $location.path('/cidades');
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

        $scope.deleteAlert = function(cidade) {
            SweetAlert.swal(SweetAlertOptions.removerCidade,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(cidade);
                        SweetAlert.swal("Removido!", "A Cidade foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Cidade não foi removida :)", "error");
                    }
                });
        };

    }
]);