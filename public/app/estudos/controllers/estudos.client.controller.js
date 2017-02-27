/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('estudos').controller('EstudosController', ['$scope', '$uibModal', '$routeParams', '$location', 'Produtos', 'Estudos', '$http', '$stateParams', 'toaster', 'CompAmazon', 'CompEstudos', 'CompGraficos',
    function($scope, $uibModal, $routeParams, $location, Produtos, Estudos, $http, $stateParams, toaster, CompAmazon, CompEstudos, CompGraficos) {

        $scope.piePoints = [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}];
        $scope.pieColumns = [{"id": "Frete", "type": "pie"}, {"id": "Fob", "type": "pie"}, {"id": "Custos", "type": "pie"}, {"id": "Taxas", "type": "pie"}];
        $scope.erros = {
            produto: {
                fob: []
            },
            estudo: {

            }
        };

        $scope.testeErros = function() {
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/viewErros.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        }; // todo Mudar o nome da função

        $scope.quantidades = [];
        // $scope.produtosDoEstudo = [];
        $scope.estudo = {};
        CompGraficos.set.estudo($scope.estudo);
        $scope.parametros = {};

        $scope.graficos = {
            geral: {
                piePoints: [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}],
                pieColumns: [{"id": "Frete", "type": "pie"}, {"id": "Fob", "type": "pie"}, {"id": "Custos", "type": "pie"}, {"id": "Taxas", "type": "pie"}]
            }
        };

        $scope.custo_internacional = {
            // Variável referenciada no formulário modal usada para inserir a custo em <$scope.estudo> custos[].
            // Custos a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
            // desc: '',
            // usd: 0,
            // brl: 0
        };
        $scope.currentProduto = {}; // Variável que armazena o produto selecionado para usar com ng-model e outras operações.
        $scope.custo_internacional_produto = {
            // Variável referenciada no formulário modal usada para inserir a custo internacional individualizada em <estudo_do_produto> custos[].
            // Custos a serem diluídas no preço do produto.
            // desc: '',
            // usd: 0,
            // brl: 0
        };

        function totalizaCustosInternacionais() {
            // Compartilhadas
            processaCustosInternacionaisIndividuais();
            determinaProporcionalidadeDosProdutos();
            processaCustosInternacionaisCompartilhadas();

        }

        function determinaProporcionalidadeDosProdutos() {
            // let _fob = 0;
            // let _peso = 0;
            // $scope.produtosDoEstudo.forEach(function (prod) {
            //     if(prod.estudo_do_produto.qtd > 0) {
            //         _fob += prod.estudo_do_produto.custo_unitario * prod.estudo_do_produto.qtd;
            //         _peso += prod.peso * prod.estudo_do_produto.qtd;
            //     }
            // });
            // $scope.produtosDoEstudo.forEach(function (prod) {
            //     if(prod.estudo_do_produto.qtd > 0 && _fob > 0) {
            //         prod.estudo_do_produto.proporcionalidade.fob = (prod.estudo_do_produto.custo_unitario * prod.estudo_do_produto.qtd) / _fob;
            //         prod.estudo_do_produto.proporcionalidade.peso = ((prod.peso * prod.estudo_do_produto.qtd) / _peso);
            //     } else {
            //         prod.estudo_do_produto.proporcionalidade.fob = 0;
            //         prod.estudo_do_produto.proporcionalidade.peso = 0;
            //     }
            // });
        }

        function processaCustosInternacionaisCompartilhadas() {

            // Totaliza as custos internacionais compartilhadas.
            // let total = {usd: 0, brl: 0};
            // let despC = $scope.estudo.custos.internacionais.compartilhadas;
            // for(let i = 0; i < despC.length; i++) { // totaliza as custos no objeto estudo.
            //     total.usd += despC[i].usd;
            //     total.brl += despC[i].brl;
            // }
            // $scope.estudo.custos.internacionais.totais = total;
            //
            // // Seta os valores proporcionais das custos internacionais compartilhadas em cada um dos produtos.
            // $scope.produtosDoEstudo.forEach(function (produto) {
            //     if(produto.estudo_do_produto.qtd > 0) {
            //         let despProdInt = produto.estudo_do_produto.custos.internacionais;
            //         let auxTotal = {usd: 0, brl: 0}; // objeto para ser jogado no array de int.compartilhadas.
            //         despProdInt.compartilhadas = [];
            //         for(let i = 0; i < despC.length; i++) {
            //             let desc = despC[i].desc;
            //             let usd = produto.estudo_do_produto.proporcionalidade.fob * despC[i].usd;
            //             let brl = produto.estudo_do_produto.proporcionalidade.fob * despC[i].brl;
            //             despProdInt.compartilhadas.push({'desc': desc, 'usd': usd, 'brl': brl});
            //             despProdInt.totais.usd += usd;
            //             despProdInt.totais.brl += brl;
            //         }
            //     }
            // });
        }
        function processaCustosInternacionaisIndividuais() {

            // $scope.produtosDoEstudo.forEach(function (produto) {
            //     produto.estudo_do_produto.custos.internacionais.totais = {'usd': 0, 'brl': 0};
            //     produto.estudo_do_produto.custos.internacionais.individualizadas.forEach(function(desp) {
            //         produto.estudo_do_produto.custos.internacionais.totais.usd += desp.usd;
            //         produto.estudo_do_produto.custos.internacionais.totais.brl += desp.brl;
            //     });
            // });

        }


        $scope.create = function() {
            let arrayTestes = [];
            for(let i = 0; i < $scope.produtosDoEstudo.length; i++) {
                let obj = {
                    produto_ref: $scope.produtosDoEstudo[i],
                    estudo_do_produto: $scope.produtosDoEstudo[i].estudo_do_produto
                };
                arrayTestes.push(obj);
            }
            let estudo = new Estudos({
                nome_estudo: $scope.estudo.nome_estudo,
                estudo: $scope.estudo,
                produtosDoEstudo: arrayTestes,
                parametros: $scope.parametros
            });
            estudo.$save(function (response) {
                alert(`Estudo id: ${response._id} criado com sucesso`);
            }, function(errorResponse) {
                console.log(errorResponse);
                toaster.pop({
                    type: 'error',
                    title: 'Erro',
                    body: errorResponse.message,
                    timeout: 3000
                });
            });
        };
        $scope.loadOne = function(id) {
            Estudos.get({
                estudoId: id
            }).$promise.then(function (data) {
                let estudo = data;
                //$scope.estudo = estudo.estudo;
                let prdEstudo = estudo.produtosDoEstudo;
                for (let i = 0; i < prdEstudo.length; i++) {
                    let produto = prdEstudo[i].produto_ref;
                    produto.estudo_do_produto = prdEstudo[i].estudo_do_produto;
                    $scope.produtosDoEstudo.push(produto);
                }
                $scope.parametros = data.parametros;
                $scope.iniImport();
            });
        };
        $scope.loadAll = function() {
            Estudos.query().$promise.then(function (data) {
                $scope.loadedEstudos = data;
            });
            // $scope.loadedEstudos = Estudos.query();
        };

        /**
         * Carrega os dados à partir do BD e arquivos para <$scope.produtos> / <$scope.custos> / <$scope.parametros>
         */
        $scope.loadData = function() {
            $scope.produtos = Produtos.query();
            $scope.estudo = CompEstudos.criaEstudo();
            $scope.produtosDoEstudo = $scope.estudo.lista_produtos;
            $scope.parametros = $scope.estudo.parametros;
            CompGraficos.set.estudo($scope.estudo);

            $scope.graficos.geral = CompGraficos.geral();

        };

        $scope.testeModal = function() {
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/save-estudo.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        }; // todo Mudar o nome da função
        $scope.produtoViewModal = function(produto) {
            $scope.currentProdutoView = produto;
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/view-produto-estudo.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        }; // todo Mudar o nome da função

        /**
         * Invoca o formulário modal em que o usuário vai informar o nome e o valor da custo compartilhada.
         */
        $scope.addCustoInternacionalCompartilhadaModal = function() {
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/adiciona-custo-internacional-compartilhado.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        };

        /**
         * Evento invocado pelo formulário modal. Adiciona o "objeto" custo internacional compartilhada ao array de respectivas custos.
         */
        $scope.addCustoInternacionalCompartilhada = function() {
            $scope.custo_internacional.brl = $scope.custo_internacional.usd * $scope.parametros.cotacao_dolar; // Convertendo custo internacional para brl.
            $scope.estudo.custos.internacionais.compartilhadas.push($scope.custo_internacional); // todo: Ver como "zerar" o objeto.
            $scope.custo_internacional = {};
            totalizaCustosInternacionais();
            processaMudancasTodosProdutos('custos');
        };

        /**
         * Invoca o formulário modal em que o usuário vai informar o nome e o valor da custo compartilhada.
         */
        $scope.addCustoInternacionalDoProdutoModal = function(produto) {
            $scope.currentProduto = produto;
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/adiciona-custo-internacional-individual.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        };

        $scope.addCustoInternacionalDoProduto = function() {
            let produto = $scope.currentProduto;
            $scope.custo_internacional_produto.brl = $scope.custo_internacional_produto.usd * $scope.parametros.cotacao_dolar; // Convertendo custo internacional para brl.
            produto.estudo_do_produto.custos.internacionais.individualizadas.push($scope.custo_internacional_produto);
            $scope.custo_internacional_produto = {};
            $scope.currentProduto = {};
            totalizaCustosInternacionais();
            processaMudancasTodosProdutos('custos');
        };

        /**
         * Adiciona objeto <estudo_do_produto> ao objeto <produto> e depois faz um push para adicionar <produto> no array $scope.produtosDoEstudo.
         * @param produto
         */
        $scope.adicionaProdutoEstudo = function(produto) { // todo: Renomear > Este nome não faz o menor sentido !!!!
            if ($scope.produtosDoEstudo.indexOf(produto) === -1){
                produto.estudo_do_produto = CompEstudos.criaEstudoDoProduto(produto);
                $scope.produtosDoEstudo.push(produto);
            }
        };

        $scope.removeProdutoEstudo = function(item) {
            $scope.produtosDoEstudo.splice($scope.produtosDoEstudo.indexOf(item), 1);
            CompEstudos.zeraDadosDoEstudo();
            $scope.iniImport();
        };

        /**
         * Ajusta os valores digitados na tabela do produto da página main-estudos.client.view.html
         * <custo_cheio> / <custo_paypal> / <custo_dentro> / <qtd> / <custos>
         * @param produto - objeto <produto> proveniente da iteração ng-repeat pelos produtos adicionados ao estudo.
         * @param campo - string utilizada para designar qual é o campo que está sendo modificado.
         */
        $scope.processaMudancas = function(produto, campo) {
            totalizaCustosInternacionais();
            auxProcessaMudancas(produto, campo);
            $scope.iniImport();

        };

        function auxProcessaMudancas (produto, campo) {
            // As letiáveis abaixo servem apenas para reduzir o tamanho dos nomes.
            // let aux = produto.estudo_do_produto;
            // let desp = aux.custos.internacionais.totais;
            // let cUnit = produto.estudo_do_produto.custo_unitario;
            // let despUnit = 0;
            // if(aux.qtd > 0) {
            //     despUnit = desp.usd / aux.qtd;
            // }
            // let cCheio = produto.custo_usd + despUnit;
            // cUnit.cheio.usd = cCheio; // Este objeto é inicializado com o valor custo_usd do produto. Aqui ele é alterado para refletir o total inicial + as custos do produto.
            // switch (campo) {
            //     case 'custo_paypal':
            //         produto.estudo_do_produto.memoria_paypal = cUnit.paypal.usd;
            //         cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
            //         break;
            //     case 'custo_dentro':
            //         cUnit.paypal.usd = cCheio - cUnit.declarado.usd;
            //         break;
            //     case 'qtd':
            //         cUnit.paypal.usd = produto.estudo_do_produto.memoria_paypal + despUnit;
            //         cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
            //         break;
            //     case 'custos':
            //         cUnit.paypal.usd = produto.estudo_do_produto.memoria_paypal + despUnit;
            //         cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
            //         break;
            // }
            // testaSomatorioValoresProduto(produto);
        }

        function processaMudancasTodosProdutos(campo) {
            $scope.produtosDoEstudo.forEach(function (produto) {
                auxProcessaMudancas(produto, campo);
            });
            $scope.iniImport();
        }


        /**
         * Função muito útil para comparar x letiáveis e descobrir se são iguais entre si.
         * @returns {boolean}
         */
        function areEqual(){
            let len = arguments.length;
            for (let i = 1; i< len; i++){
                if (arguments[i] == null || arguments[i] != arguments[i-1])
                    return false;
            }
            return true;
        }

        //region Etapas para cálculo do estudo - iniImp()

        function zeraDadosGrafico() {
            // $scope.piePoints = [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}];
            CompGraficos.estudo.zera();
        }

        function totalizaCustosInternacionaisDoProduto(produto) {
            let desp = produto.estudo_do_produto.custos.internacionais;
            desp.totais = {usd: 0, brl: 0};
            for(let i = 0; i < desp.individualizadas; i++) {
                desp.totais += desp.individualizadas[i];
            }
        }


        function criaGraficos() {

            $scope.piePoints = CompGraficos.estudo.geral();

            // $scope.piePoints = [
            //     {"Frete": $scope.estudo.resultados.comparacao.percentual_frete()},
            //     {"Fob": $scope.estudo.resultados.comparacao.percentual_fob()},
            //     {"Custos": $scope.estudo.resultados.comparacao.percentual_custos()},
            //     {"Taxas": $scope.estudo.resultados.comparacao.percentual_taxas()}
            // ];

        }

        $scope.iniImportOld = function() {
            CompEstudos.zeraDadosDoEstudo();
            zeraDadosGrafico();
            if($scope.produtosDoEstudo.length > 0)
            {
                // CompEstudos.setFobProdutos(); //Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
                // CompEstudos.totalizaDadosBasicosEstudo(); // Itera produtos para totalizar dados do <$scope.estudo> como FOBs, Peso e Volume.
                CompEstudos.totalizaCustosDoEstudo(); // Itera pelo objeto <$scope.custos> e faz o somatório para adicionar ao <$scope.estudo>
                CompEstudos.geraEstudoDeCadaProduto(); // Itera por cada produto de <$scope.ProdutosDoEstudo> para gerar um <estudo_do_produto> com os custos de importação individualizados e totalizar <$scope.estudo>.
                criaGraficos();
            }
        };

        $scope.iniImport = function() {
            zeraDadosGrafico();
            if($scope.produtosDoEstudo.length > 0)
            {
                // CompEstudos.setFobProdutos(); //Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
                CompEstudos.iniProcesso();
                criaGraficos();
            }
        };

        //endregion

        $scope.comparaDados = function() {
            zeraErros();
            $scope.produtosDoEstudo.forEach(function (produto) {
                if(produto.estudo_do_produto.qtd > 0) {
                    if (regraFobProduto(produto)) {
                        $scope.erros.produto.fob.push({'produto': `FOB ${produto.nome} : OK !!!`});
                    } else {
                        $scope.erros.produto.fob.push({'produto': `FOB ${produto.nome} : Erro !!`});
                    }
                    if(regraValorUnitarioInvestimento(produto)) {
                        $scope.erros.produto.fob.push({'produto': `Custo ${produto.nome} : OK !!! Custo Unitário * qtd = total do investimento em BRL`});
                    } else {
                        $scope.erros.produto.fob.push({'produto': `FOB ${produto.nome} : Erro !! Custo Unitário * qtd != total do investimento em BRL`});
                    }
                }
            });

        };

        function regraFobProduto(produto) {
            let fob = produto.estudo_do_produto.fob;
            return areEqual(fob.cheio.usd, (fob.declarado.usd + (fob.paypal.usd - fob.paypal.taxa_iof.usd - fob.paypal.taxa_paypal.usd)));
        }

        function regraValorUnitarioInvestimento(produto) {
            let total_brl = produto.estudo_do_produto.qtd * produto.estudo_do_produto.resultados.precos.custo.final.brl;
            return comparaValoresComMargem(produto.estudo_do_produto.resultados.investimento.final.brl, total_brl, 0.5);
        }

        function comparaValoresComMargem(valor_a, valor_b, margem) {
            let result = valor_a - valor_b;
            if (result < 0) {
                result = result * -1;
            }
            return (result < margem);
        }

        function zeraErros() {
            $scope.erros = {
                produto: {
                    fob: []
                },
                estudo: {

                }
            };
        }


    }
]);
