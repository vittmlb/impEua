/**
 * Created by Vittorio on 13/08/2016.
 */
angular.module('fornecedores').controller('FornecedoresController', ['$scope', '$stateParams', '$location', 'Fornecedores', 'Cidades', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Fornecedores, Cidades, toaster, SweetAlert) {
        $scope.ListaCidades = Cidades.query();
        var SweetAlertOptions = {
            removerFornecedor: {
                title: "Deseja remover o Fornecedor?",
                text: "Você não poderá mais recuperá-lo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $scope.create = function() {
            var fornecedor = new Fornecedores({
                nome_fornecedor: this.nome_fornecedor,
                razao_social: this.razao_social,
                email: this.email,
                cidade_fornecedor: this.cidade_fornecedor
            });
            fornecedor.$save(function (response) {
                $location.path('/fornecedores/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse;
            });
        };
        $scope.find = function() {
            $scope.fornecedores = Fornecedores.query();
        };
        $scope.findOne = function() {
            $scope.fornecedor = Fornecedores.get({
                fornecedorId: $stateParams.fornecedorId
            });
        };
        $scope.update = function() {
            $scope.fornecedor.$update(function (response) {
                $location.path('/fornecedores/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse;
            });
        };
        $scope.delete = function(fornecedor) {
            if(fornecedor) {
                fornecedor.$remove(function () {
                    for(var i in $scope.fornecedores) {
                        if($scope.fornecedores[i] === fornecedor) {
                            $scope.fornecedores.splice(i, 1);
                        }
                    }
                }, function(errorResponse) {
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data.message,
                        timeout: 4000
                    });
                });
            } else {
                $scope.fornecedor.$remove(function () {
                    $location.path('/fornecedores');
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

        $scope.deleteAlert = function(fornecedor) {
            SweetAlert.swal(SweetAlertOptions.removerFornecedor,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(fornecedor);
                        SweetAlert.swal("Removido!", "O Fornecedor foi removido.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "O Fornecedor não foi removido :)", "error");
                    }
                });
        };

    }
]);