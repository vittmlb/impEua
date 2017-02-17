/**
 * Created by Vittorio on 15/02/2017.
 */
angular.module('amazonrules').controller('AmazonrulesController', ['$scope', '$stateParams', '$location', 'Amazonrules', 'toaster', 'SweetAlert', '$http',
    function($scope, $stateParams, $location, Amazonrules, toaster, SweetAlert, $http) {
        let SweetAlertOptions = {
            removerAmazonrule: {
                title: "Deseja remover a Amazon Rule?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };

        $scope.loadData = function() {
            $http.get('/app/data/amazon_config.json').success(function (data) {

            });
        };

        $scope.tiposSet = ['Vigência', 'Intervalo Data', 'Dimensionamento', 'Pesagem'];
        $scope.tiposRule = ['volume', 'medida', 'peso', 'data'];
        $scope.tiposOperador = [`igual`, 'maior', 'menor', 'maior ou igual', 'menor ou igual'];
        $scope.tiposUnidade = ['oz', 'lb', 'polegadas'];
        $scope.tiposLados = ['shortest side', 'median side', 'longest side', 'longest plus girth'];


        $scope.objRule = {};
        $scope.setRules = [];

        $scope.arrayCriteriosSize = [];
        $scope.objCriterioSize = {};


        $scope.create = function() {
            let amazonrule = new Amazonrules({
                nome_set: this.nome_set,
                tipo_set: this.tipo_set,
                rule_set: $scope.setRules
            });
            amazonrule.$save(function (response) {
                $location.path('/amazonrules/' + response._id);
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
            $scope.amazonrules = Amazonrules.query();
        };
        $scope.findOne = function() {
            Amazonrules.get({
                amazonruleId: $stateParams.amazonruleId
            }).$promise.then(function (data) {
                $scope.amazonrule = data;
                $scope.amazonrule.rule_set.forEach(function (regra) {
                    $scope.setRules.push(regra);
                });
            });
        };
        $scope.update = function() {
            $scope.amazonrule.$update(function (response) {
                $location.path('/amazonrules/' + response._id);
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
        $scope.delete = function(amazonrule) {
            if(amazonrule) {
                amazonrule.$remove(function () {
                    for(let i in $scope.amazonrules) {
                        if($scope.amazonrules[i] === amazonrule) {
                            $scope.amazonrules[i].splice(i, 1);
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
                $scope.amazonrule.$remove(function () {
                    $location.path('/amazonrules');
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

        $scope.deleteAlert = function(amazonrule) {
            SweetAlert.swal(SweetAlertOptions.removerAmazonrule,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(amazonrule);
                        SweetAlert.swal("Removida!", "A Amazon Rule foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Amazon Rule não foi removida :)", "error");
                    }
                });
        };

        $scope.addRegras = function() {
            if($scope.amazonrule) {
                $scope.amazonrule.rule_set.push($scope.objRule);
            } else {
                $scope.setRules.push($scope.objRule);
            }
            $scope.objRule = {};
        };
        $scope.removeRegras = function(regra) {
            let index = $scope.amazonrule.rule_set.indexOf(regra);
            if($scope.amazonrule) {
                $scope.amazonrule.rule_set.splice(index, 1);
            } else {
                $scope.setRules.splice(index, 1);
            }
        };

    }
]);