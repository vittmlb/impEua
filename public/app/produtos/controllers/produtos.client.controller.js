/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('produtos').controller('ProdutosController', ['$scope', '$routeParams', '$location', 'Produtos', 'Fornecedores', 'Hscodes', '$stateParams', '$state', 'Upload', '$window',
    function($scope, $routeParams, $location, Produtos, Fornecedores, hscodes, $stateParams, $state, Upload, $window) {

        let SweetAlertOptions = {
            removerProduto: {
                title: "Deseja remover o Produto?",
                text: "Você não poderá mais recuperá-lo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",confirmButtonText: "Sim, remover!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false }
        };

        $scope.ListaFornecedores = Fornecedores.query();

        $scope.volCBM20 = '';
        $scope.qtdCBM20 = '';
        $scope.volCBM40 = '';
        $scope.qtdCBM40 = '';
        $scope.largura = '';
        $scope.altura = '';
        $scope.comprimento = '';
        $scope.cbmProduto20 = '';
        $scope.cbmProduto40 = '';
        $scope.cbmProdutoMedidas = '';
        $scope.mockProduto = new Produtos({
            nome: 'Mocking',
            modelo: 'MDB',
            descricao: 'Mocking Produto System',
            custo_usd: 10000,
            ncm: '99.99.99.99',
            impostos: {
                ii: 0.18,
                ipi: 0.15,
                pis: 0.05,
                cofins: 0.02
            },
            medidas: {
                cbm: 0.05,
                peso: 1
            },
            website: 'www.www.com.br',
            notas: 'Aloha'
        });
        $scope.ListaHsCodes = hscodes.query();
        $scope.ncm = {};
        $scope.hs = {};
        $scope.parsed_ncm = {};
        $scope.parsed_hs = {};
        $scope.usa_duty_hs = true;
        $scope.impostosDoProduto = {};
        
        $scope.calculaCBM = function(item) {
            if(item === 20) {
                if ($scope.volCBM20 > 0 && $scope.qtdCBM20 > 0) {
                    $scope.cbmProduto20 = Number($scope.volCBM20 / $scope.qtdCBM20);
                } else {
                    $scope.cbmProduto20 = '';
                }
            } else if (item === 40) {
                if ($scope.volCBM40 > 0 && $scope.qtdCBM40 > 0) {
                    $scope.cbmProduto40 = $scope.volCBM40 / $scope.qtdCBM40;
                } else {
                    $scope.cbmProduto40 = '';
                }
            } else if (item === 'medidas') {
                if ($scope.largura > 0 && $scope.altura > 0 && $scope.comprimento > 0) {
                    $scope.cbmProdutoMedidas = $scope.largura * $scope.altura * $scope.comprimento;
                } else {
                    $scope.cbmProdutoMedidas = '';
                }
            }
        };

        $scope.create = function() {
            let produto = new Produtos({
                nome: this.nome,
                modelo: this.modelo,
                descricao: this.descricao,
                custo_usd: this.custo_usd,
                moq: this.moq,
                // ncm: parsed_ncm._id,
                // ncm: $scope.parsed_ncm._id,
                hs: $scope.parsed_hs._id,
                usa_impostos_hs: this.usa_impostos_ncm,
                // impostos: $scope.impostos,
                duty: this.duty,
                medidas: {
                    cbm: this.medidas.cbm,
                    peso: this.medidas.peso
                },
                embalagem: this.embalagem,
                website: this.website,
                notas: this.notas,
                fornecedor: this.fornecedor
            });
            // let produto = $scope.mockProduto;
            let p = $scope.validateForm(produto); // Validates form and uploads image.
            p.then(function(newProduto) {
                newProduto.$save(function (response) {
                    $location.path('/produtos/' + response._id);
                }, function(errorResponse) {
                    console.log(errorResponse);
                    $scope.error = errorResponse.data.message;
                });
            }, function() {
                produto.$save(function (response) {
                    $location.path('/produtos/' + response._id);
                }, function (errorResponse) {
                    console.log(errorResponse);
                    $scope.error = errorResponse.data.message;
                });
            });
        };
        $scope.find = function() {
            $scope.produtos = Produtos.query();
        };
        $scope.findOne = function() {
            Produtos.get({
                produtoId: $stateParams.produtoId
            }).$promise.then(function (data) {
                $scope.produto = data;
            });
        };
        $scope.delete = function(produto) {
            if(produto) {
                produto.$remove(function () {
                    for (let i in $scope.produtos) {
                        if($scope.produtos[i] === produto) {
                            $scope.produtos.splice(i, 1);
                        }
                    }
                });
            } else {
                $scope.produto.$remove(function () {
                    $location.path('/produtos');
                });
            }
        };
        $scope.update = function() {
            if(!$scope.file) {
                $scope.produto.$update(function () {
                    $location.path('/produtos/' + $scope.produto._id);
                }, function(errorResponse) {
                    console.log(errorResponse);
                    $scope.error = errorResponse.data.message;
                });
            } else {
                let p = $scope.validateForm($scope.produto);
                p.then(function (newProduto) {
                    $scope.produto = newProduto;
                    $scope.produto.$update(function (response) {
                        $location.path('/produtos/' + response._id);
                    }, function(errorResponse) {
                        console.log(errorResponse);
                        $scope.error = errorResponse.data.message;
                    });
                });
            }
        };

        $scope.atualizaImpostos = function() {
            if($scope.usa_impostos_ncm) {
                $scope.parsed_ncm = JSON.parse($scope.hs);
                $scope.parsed_hs = JSON.parse($scope.hs);
                if($scope.usa_impostos_ncm) {
                    $scope.impostos = $scope.parsed_ncm.impostos;
                    $scope.duty = $scope.parsed_hs.duty
                }
            }
        };
        $scope.atualizaImpostosEdit = function() {
            if($scope.produto.usa_impostos_ncm) {
                $scope.produto.impostos = $scope.produto.ncm.impostos;
            }
        };

        /**
         * Valida formulário e usa Serviço Upload para upar a imagem do produto.
         * @param produto
         * @returns {Promise}
         */
        $scope.validateForm = function(produto) { // todo: implementar validação dos demais dados do formulário. No momento, apenas o arquivo e validado.
            return new Promise(function(resolve) {
                if($scope.form.file.$valid && $scope.file) {
                    return resolve($scope.uploadImage($scope.file, produto));
                } else {
                    return reject();
                }
            });
        };

        $scope.uploadImage = function (thisFile, produto) {
            return Upload.upload({
                url: 'http://localhost:5000/api/uploadimages/produtos', //webAPI exposed to upload the file
                data:{file:thisFile} //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
                if(resp.data.error_code === 0){ //validate success
                    $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: '); //todo: usar ngToast
                    produto.img_url = '/uploads/images/' + resp.data.file_path;
                    return produto;
                } else {
                    console.log(resp);
                    $window.alert('an error occured'); //todo: user ngToast
                    return produto;
                }
            }, function (resp) { //catch error
                console.log('Error status: ' + resp.status);
                $window.alert('Error status: ' + resp.status); //todo: user ngToast
            }, function (evt) {
                console.log(evt);
                let progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                $scope.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
            });
        };

        $scope.deleteAlert = function(produto) {
            SweetAlert.swal(SweetAlertOptions.removerProduto,
                function(isConfirm){
                    if (isConfirm) {
                        $scope.delete(produto);
                        SweetAlert.swal("Removido!", "O Produto foi removido.", "success");
                    } else {
                        SweetAlert.swal("Cancelado", "O Produto não foi removido :)", "error");
                    }
                });
        };

    }
]);
