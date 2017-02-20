/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonfees').controller('AmazonfeesController', ['$scope', '$stateParams', '$location', 'Amazonfees', 'toaster', 'SweetAlert', 'AmazonrulesQueries',
    function($scope, $stateParams, $location, Amazonfees, toaster, SweetAlert, AmazonrulesQueries) {
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
        $scope.tiposMedia = ['media', 'non-media'];
        $scope.listaTiposUnidade = ['oz', 'lb', 'polegadas', 'metro', 'm3'];


        $scope.setRules = [];

        loadListas();
        function loadListas() {
            AmazonrulesQueries.query({
                tiposetId: 'Merda'
            }).$promise.then(function (data) {
                $scope.listaRules = data;
            });
        }

        $scope.create = function() {
            let amazonfee = new Amazonfees({
                nome_fee: this.nome_fee,
                tipo_fee: this.tipo_fee,
                media_fee: this.media_fee,
                rules_fee: this.rules_fee,
                tem_valor_calculado: this.tem_valor_calculado,
                dados_fee: this.dados_fee
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
            Amazonfees.get({
                amazonfeeId: $stateParams.amazonfeeId
            }).$promise.then(function (data) {
                $scope.amazonfee = data;
                $scope.setRules = $scope.amazonfee.rules_fee;
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
                            $scope.amazonfees.splice(i, 1);
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
            if($scope.amazonfee) {
                // $scope.amazonfee.criterios_size.regras.push($scope.objCriterioSize);
            } else {
                $scope.arrayCriteriosSize.push($scope.objCriterioSize);
            }
            $scope.objCriterioSize = {};
        };
        $scope.removeRegras = function(regra) {
            if($scope.amazonfee) {
                let index = $scope.amazonfee.criterios_size.regras.indexOf(regra);
                $scope.amazonfee.criterios_size.regras.splice(index, 1);
            } else {
                let index = $scope.arrayCriteriosSize.indexOf(regra);
                $scope.arrayCriteriosSize.splice(index, 1);
            }
        };

    }
]);