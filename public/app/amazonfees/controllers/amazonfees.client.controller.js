/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonfees').controller('AmazonfeesController', ['$scope', '$stateParams', '$location', 'Amazonfees', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Amazonfees, toaster, SweetAlert) {
        let SweetAlertOptions = {
            removerAmazonfee: {
                title: "Deseja remover a Amazon Fee?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };

        $scope.tiposFee = ['FBA Fulfillment Fees', 'Monthly Inventory Storage Fees', 'Inventory Placement Service Fees'];
        $scope.tiposDimensao = ['volume', 'medida', 'peso', 'data'];
        $scope.tiposOperador = [`igual`, 'maior', 'menor', 'maior ou igual', 'menor ou igual', '>='];
        $scope.tiposUnidade = ['oz', 'lb', 'polegadas'];
        $scope.tiposCriteriosSize = ['Small stantard-size', 'Large stantard-size', 'Small oversize', 'Medium oversize', 'Large oversize', 'Special oversize' ];
        $scope.tiposLadosCriteriosSize = ['shortest', 'median', 'longest', 'longest plus girth'];

        $scope.arrayCriteriosSize = [];
        $scope.objCriterioSize = {};


        $scope.create = function() {
            let amazonfee = new Amazonfees({
                nome_fee: this.nome_fee,
                tipo_fee: this.tipo_fee,
                criterios_size: {
                    nome_size: this.nome_size,
                    regras: $scope.arrayCriteriosSize
                }
            });
            amazonfee.$save(function (response) {
                $location.path('/amazonfees/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse.data,
                    timeout: 4000
                });
            });
        };
        $scope.find = function() {
            $scope.amazonfees = Amazonfees.query();
        };
        $scope.findOne = function() {
            $scope.amazonfee = Amazonfees.get({
                amazonfeeId: $stateParams.amazonfeeId
            });
        };
        $scope.update = function() {
            $scope.amazonfee.$update(function (response) {
                $location.path('/amazonfees/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse.data,
                    timeout: 4000
                });
            });
        };
        $scope.delete = function(amazonfee) {
            if(amazonfee) {
                amazonfee.$remove(function () {
                    for(let i in $scope.amazonfees) {
                        if($scope.amazonfees[i] === amazonfee) {
                            $scope.amazonfees[i].splice(i, 1);
                        }
                    }
                }, function(errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data,
                        timeout: 4000
                    });
                });
            } else {
                $scope.amazonfee.$remove(function () {
                    $location.path('/amazonfees');
                }, function(errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data,
                        timeout: 4000
                    });
                });
            }
        };

        $scope.deleteAlert = function(amazonfee) {
            SweetAlert.swal(SweetAlertOptions.removerAmazonfee,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(amazonfee);
                        SweetAlert.swal("Removida!", "A Amazon Fee foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Amazon Fee não foi removida :)", "error");
                    }
                });
        };

        $scope.addRegras = function() {
            $scope.arrayCriteriosSize.push($scope.objCriterioSize);
            $scope.objCriterioSize = {};
        };

    }
]);