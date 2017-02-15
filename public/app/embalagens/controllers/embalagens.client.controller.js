/**
 * Created by Vittorio on 14/02/2017.
 */
angular.module('embalagens').controller('EmbalagensController', ['$scope', '$routeParams', '$location', 'Embalagens', 'toaster', '$stateParams', '$state', 'SweetAlert',
    function($scope, $routeParams, $location, Embalagens, toaster, $stateParams, $state, SweetAlert) {

        let SweetAlertOptions = {
            removerContato: {
                title: "Deseja remover a Embalagem?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };

        $scope.enumModais = ['Aéreo', 'Marítimo'];

        $scope.create = function() {
            let embalagem = new Embalagens({
                nome_embalagem: this.nome_embalagem,
                dimensoes: this.dimensoes,
                volume: this.volume,
                modal: this.modal
            });
            embalagem.$save(function (response) {
                $location.path('/embalagens/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                ngToast.danger(errorResponse.data.message);
            });
        };
        $scope.find = function() {
            $scope.embalagens = Embalagens.query();
        };
        $scope.findOne = function() {
            $scope.embalagem = Embalagens.get({
                embalagemId: $stateParams.embalagemId
            });
        };
        $scope.delete = function(embalagem) {
            if(embalagem) {
                embalagem.$remove(function () {
                    for(let i in $scope.embalagens) {
                        if($scope.embalagens[i] === embalagem) {
                            $scope.embalagem.splice(i, 1);
                        }
                    }
                });
            } else {
                $scope.embalagem.$remove(function () {
                    $location.path('/embalagens');
                });
            }
        };
        $scope.update = function() {
            $scope.embalagem.$update(function () {
                $location.path('/embalagens/' + $scope.embalagem._id);
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
            SweetAlert.swal(SweetAlertOptions.removerContato,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(embalagem);
                        SweetAlert.swal("Removida!", "A Embalagem foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Embalagem não foi removida :)", "error");
                    }
                });
        };
    }
]);