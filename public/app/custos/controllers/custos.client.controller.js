/**
 * Created by Vittorio on 01/06/2016.
 */
angular.module('custos').controller('CustosController', ['$scope', '$routeParams', '$location', 'Custos', 'toaster', '$stateParams', '$state',
    function($scope, $routeParams, $location, Custos, toaster, $stateParams, $state) {
        
        $scope.enumTiposCustos = ['Valor', 'Alíquota']; // todo: Encontrar solução que envolva o mongoose.
        
        $scope.create = function() {
            let custo = new Custos({
                nome: this.nome,
                tipo: this.tipo,
                moeda: this.moeda,
                valor: this.valor,
                aliquota: this.aliquota,
                ativa: this.ativo
            });
            custo.$save(function(response) {
                $location.path('/custos/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                ngToast.danger(errorResponse.data.message);
            });
        };
        $scope.find = function() {
            $scope.custos = Custos.query()
        };
        $scope.findOne = function() {
            $scope.custo = Custos.get({
                custoId: $stateParams.custoId
            });
        };
        $scope.delete = function(custo) {
            if(custo) {
                custo.$remove(function () {
                    for (let i in $scope.custos) {
                        if($scope.custos[i] === custo) {
                            $scope.custos.splice(i, 1);
                        }
                    }
                });
            } else {
                $scope.custo.$remove(function () {
                    $location.path('/custos');
                });
            }
        };
        $scope.update = function() {
            $scope.custo.$update(function () {
                $location.path('/custos/' + $scope.custo._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse,
                    timeout: 3000
                });
            });
        };
    }
]);