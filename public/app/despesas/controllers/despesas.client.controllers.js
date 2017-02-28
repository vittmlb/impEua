/**
 * Created by Vittorio on 28/02/2017.
 */
angular.module('despesas').controller('DespesasController', ['$scope', '$routeParams', '$location', 'Despesas', 'toaster', '$stateParams', '$state', 'SweetAlert',
    function($scope, $routeParams, $location, Despesas, toaster, $stateParams, $state, SweetAlert) {
        let SweetAlertOptions = {
            removerDespesa: {
                title: "Deseja remover a Despesa?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };

        $scope.enumPeriodicidade = ['Mensal', 'Senamal', 'Diária', 'Trimestral', 'Semestral', 'Anual'];
        $scope.enumTipoDespesa = ['Valor', 'Percentual'];

        $scope.create = function() {
            let despesa = new Despesas({
                nome_despesa: this.nome_despesa,
                periodicidade: this.periodicidade,
                tipo_despesa: this.tipo_despesa,
                valor_despesa: this.valor_despesa,
                percentual_despesa: this.percentual_despesa
            });
            despesa.$save(function (response) {
                $location.path('/despesas/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                ngToast.danger(errorResponse.data.message);
            });
        };
        $scope.find = function() {
            $scope.despesas = Despesas.query();
        };
        $scope.findOne = function() {
            Despesas.get({
                despesaId: $stateParams.despesaId
            }).$promise.then(function (data) {
                $scope.despesa = data;
            });
        };
        $scope.delete = function(despesa) {
            if(despesa) {
                despesa.$remove(function () {
                    for(let i in $scope.despesas) {
                        if($scope.despesas[i] === despesa) {
                            $scope.despesas.splice(i, 1);
                        }
                    }
                });
            } else {
                $scope.despesa.$remove(function () {
                    $location.path('/despesas');
                });
            }
        };
        $scope.update = function() {
            $scope.despesa.$update(function () {
                $location.path('/despesas/' + $scope.despesa._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse,
                    timeout: 3000
                });
            });
        };

        $scope.deleteAlert = function(embalagem) {
            SweetAlert.swal(SweetAlertOptions.removerDespesa,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(embalagem);
                        SweetAlert.swal("Removida!", "A Despesa foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Despesa não foi removida :)", "error");
                    }
                });
        };

    }
]);