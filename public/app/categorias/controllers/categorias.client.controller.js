/**
 * Created by Vittorio on 02/09/2016.
 */
angular.module('categorias').controller('CategoriasController', ['$scope', '$stateParams', '$location', 'Categorias', 'toaster', 'SweetAlert',
    function($scope, $stateParams, $location, Categorias, toaster, SweetAlert) {
        var SweetAlertOptions = {
            removerCategoria: {
                title: "Deseja remover a Categoria?",
                text: "Você não poderá mais recuperá-la!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };
        $scope.create = function() {
            var categoria = new Categorias({
                nome_categoria: this.nome_categoria,
                icon_categoria: this.icon_categoria,
                descricao_categoria: this.descricao_categoria,
                notas_categoria: this.notas_categoria,
                tags: this.tags,
                subcategorias: this.subcategorias,
                _produtoId: this._produtoId,
                _fornecedorId: this._fornecedorId
            });
            categoria.$save(function (response) {
                $location.path('/categorias/' + response._id);
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
            $scope.categorias = Categorias.query();
        };
        $scope.findOne = function() {
            $scope.categoria = Categorias.get({
                categoriaId: $stateParams.categoriaId
            });
        };
        $scope.update = function() {
            $scope.categoria.$update(function (response) {
                $location.path('/categorias/' + response._id);
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
        $scope.delete = function(categoria) {
            if(categoria) {
                categoria.$remove(function () {
                    for (var i in $scope.categorias) {
                        if ($scope.categorias[i] === categoria) {
                            $scope.categorias.splice(i, 1);
                        }
                    }
                }, function (errorResponse) {
                    console.log(errorResponse);
                    toaster.pop({
                        type: 'error',
                        title: 'Erro',
                        body: errorResponse.data,
                        timeout: 4000
                    });
                });
            } else {
                $scope.categoria.$remove(function () {
                    $location.path('/categorias');
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
        $scope.deleteAlert = function(categoria) {
            SweetAlert.swal(SweetAlertOptions.removerCategoria,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(categoria);
                        SweetAlert.swal("Removido!", "A Categoria foi removida.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "A Categoria não foi removida :)", "error");
                    }
                });
        };
    }
]);