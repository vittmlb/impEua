/**
 * Created by Vittorio on 04/08/2016.
 */
angular.module('hs').controller('HscodeController', ['$scope', '$stateParams', '$location', 'Hscodes', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Hscodes, toaster, SweetAlert) {
        let SweetAlertOptions = {
            removerHS: {
                title: "Deseja remover o Código HS?",
                text: "Você não poderá mais recuperá-lo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $scope.create = function() {
            let hs = new Hscodes({
                cod_hs: this.cod_hs,
                descricao: this.descricao,
                li: this.li,
                duty: this.duty,
                obs: this.obs
            });
            hs.$save(function (response) {
                $location.path('/hscode/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse.data.message; // todo: Sistema de notificação
            });
        };
        $scope.find = function() {
            $scope.hscodes = Hscodes.query();
        };
        $scope.findOne = function() {
            $scope.hs = Hscodes.get({
                hsId: $stateParams.hsId
            });
        };
        $scope.update = function() {
            $scope.hs.$update(function (response) {
                $location.path('/hscode/' + response._id);
            }, function(errorResponse) {
                console.log(errorResponse);
                $scope.error = errorResponse; // todo: Implantar sistema de notificaçao.
            });
        };
        $scope.delete = function(hs) {
            if(hs) {
                hs.$remove(function () {
                    for(let i in $scope.hscodes) {
                        if($scope.hscodes[i] === hs) {
                            $scope.hscodes.splice(i, 1);
                        }
                    }
                });
            } else {
                $scope.hs.$remove(function () {
                    $location.path('/hscode');
                }, function(errorResponse) {
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data.message,
                        timeout: 4000
                    });
                });
            }
        };
        $scope.deleteAlert = function(hs) {
            SweetAlert.swal(SweetAlertOptions.removerHS,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(hs);
                        SweetAlert.swal("Removido!", "O Código HS foi removido.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "O Código HS não foi removido :)", "error");
                    }
                });
        };
    }
]);