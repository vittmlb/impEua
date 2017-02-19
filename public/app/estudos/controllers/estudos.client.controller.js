/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('estudos').controller('EstudosController', ['$scope', '$uibModal', '$routeParams', '$location', 'Produtos', 'Despesas', 'Estudos', '$http', '$stateParams', 'toaster', 'AmazonMod',
    function($scope, $uibModal, $routeParams, $location, Produtos, Despesas, Estudos, $http, $stateParams, toaster, AmazonMod) {

        $scope.piePoints = [{"Frete": 0}, {"Fob": 0}, {"Despesas": 0}, {"Taxas": 0}];
        $scope.pieColumns = [{"id": "Frete", "type": "pie"}, {"id": "Fob", "type": "pie"}, {"id": "Despesas", "type": "pie"}, {"id": "Taxas", "type": "pie"}];
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
        $scope.produtosDoEstudo = [];
        $scope.estudo = {
            nome_estudo: '',
            config: {
                volume_cntr_20: 0,
                frete_maritimo: 0,
                seguro_frete_maritimo: 0,
                comissao_amazon: 0,
                percentual_comissao_conny: 0,
                mpf: 0,
                hmf: 0,
            },
            total_comissao_conny: 0, // todo: Implementar comissão Conny
            fob: 0,
            cif: 0,
            frete_maritimo: {
                valor: 0,
                seguro: 0
            },
            medidas: {
                peso: {
                    contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                    ocupado: 0,
                    ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                },
                volume: {
                    contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
                    ocupado: 0,
                    ocupado_percentual: 0
                }
            },
            taxas: {
                duty: 0,
                mpf: 0,
                hmf: 0,
                total: 0
            },
            despesas: {
                aduaneiras: [],
                internacionais: { // Despesas originadas no exterior.
                    compartilhadas: [],
                    // compartilhadas: [{ // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                    //     desc: '',
                    //     usd: 0,
                    //     brl: 0
                    // }],
                    individualizadas: 0,  // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                    totais: 0 // Despesas internacionais totais - Somatório das despesas compartilhadas com as individualizadas
                },
                nacionais: {
                    compartilhadas: 0,
                    individualizadas: 0
                },
                total: 0
            },
            resultados: {
                investimento: 0,
                lucro: 0,
                roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                comparacao: {
                    percentual_frete: 0,
                    percentual_fob: 0,
                    percentual_duties: 0,
                    percentual_mpf: 0,
                    percentual_hmf: 0,
                    percentual_despesas: 0,
                    percentual_taxas: 0
                }
            }
        };
        $scope.config = {
            volume_cntr_20: 0,
            frete_maritimo: 0,
            seguro_frete_maritimo: 0,
            comissao_amazon: 0,
            percentual_comissao_conny: 0,
            mpf: 0,
            hmf: 0,
        };

        $scope.despesa_internacional = {
            // Variável referenciada no formulário modal usada para inserir a despesa em <$scope.estudo> despesas[].
            // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
            // desc: '',
            // usd: 0,
            // brl: 0
        };
        $scope.currentProduto = {}; // Variável que armazena o produto selecionado para usar com ng-model e outras operações.
        $scope.despesa_internacional_produto = {
            // Variável referenciada no formulário modal usada para inserir a despesa internacional individualizada em <estudo_do_produto> despesas[].
            // Despesas a serem diluídas no preço do produto.
            // desc: '',
            // usd: 0,
            // brl: 0
        };

        function totalizaDespesasInternacionais() {
            // Compartilhadas
            processaDespesasInternacionaisIndividuais();
            determinaProporcionalidadeDosProdutos();
            processaDespesasInternacionaisCompartilhadas();

        }

        function determinaProporcionalidadeDosProdutos() {
            let _fob = 0;
            let _peso = 0;
            $scope.produtosDoEstudo.forEach(function (prod) {
                if(prod.estudo_do_produto.qtd > 0) {
                    _fob += prod.estudo_do_produto.custo_unitario * prod.estudo_do_produto.qtd;
                    _peso += prod.peso * prod.estudo_do_produto.qtd;
                }
            });
            $scope.produtosDoEstudo.forEach(function (prod) {
                if(prod.estudo_do_produto.qtd > 0 && _fob > 0) {
                    prod.estudo_do_produto.proporcionalidade.fob = (prod.estudo_do_produto.custo_unitario * prod.estudo_do_produto.qtd) / _fob;
                    prod.estudo_do_produto.proporcionalidade.peso = ((prod.peso * prod.estudo_do_produto.qtd) / _peso);
                } else {
                    prod.estudo_do_produto.proporcionalidade.fob = 0;
                    prod.estudo_do_produto.proporcionalidade.peso = 0;
                }
            });
        }

        function processaDespesasInternacionaisCompartilhadas() {

            // Totaliza as despesas internacionais compartilhadas.
            let total = {usd: 0, brl: 0};
            let despC = $scope.estudo.despesas.internacionais.compartilhadas;
            for(let i = 0; i < despC.length; i++) { // totaliza as despesas no objeto estudo.
                total.usd += despC[i].usd;
                total.brl += despC[i].brl;
            }
            $scope.estudo.despesas.internacionais.totais = total;

            // Seta os valores proporcionais das despesas internacionais compartilhadas em cada um dos produtos.
            $scope.produtosDoEstudo.forEach(function (produto) {
                if(produto.estudo_do_produto.qtd > 0) {
                    let despProdInt = produto.estudo_do_produto.despesas.internacionais;
                    let auxTotal = {usd: 0, brl: 0}; // objeto para ser jogado no array de int.compartilhadas.
                    despProdInt.compartilhadas = [];
                    for(let i = 0; i < despC.length; i++) {
                        let desc = despC[i].desc;
                        let usd = produto.estudo_do_produto.proporcionalidade.fob * despC[i].usd;
                        let brl = produto.estudo_do_produto.proporcionalidade.fob * despC[i].brl;
                        despProdInt.compartilhadas.push({'desc': desc, 'usd': usd, 'brl': brl});
                        despProdInt.totais.usd += usd;
                        despProdInt.totais.brl += brl;
                    }
                }
            });
        }
        function processaDespesasInternacionaisIndividuais() {

            $scope.produtosDoEstudo.forEach(function (produto) {
                produto.estudo_do_produto.despesas.internacionais.totais = {'usd': 0, 'brl': 0};
                produto.estudo_do_produto.despesas.internacionais.individualizadas.forEach(function(desp) {
                    produto.estudo_do_produto.despesas.internacionais.totais.usd += desp.usd;
                    produto.estudo_do_produto.despesas.internacionais.totais.brl += desp.brl;
                });
            });

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
                config: $scope.config
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
                $scope.config = data.config;
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
         * Carrega os dados à partir do BD e arquivos para <$scope.produtos> / <$scope.despesas> / <$scope.config>
         */
        $scope.loadData = function() {
            $scope.produtos = Produtos.query();
            $scope.despesas = Despesas.query();
            $http.get('/app/data/config.json').success(function (data) {
                $scope.config = data;
            });
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
         * Invoca o formulário modal em que o usuário vai informar o nome e o valor da despesa compartilhada.
         */
        $scope.addDespesaInternacionalCompartilhadaModal = function() {
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/adiciona-despesa-internacional-compartilhada.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        };

        /**
         * Evento invocado pelo formulário modal. Adiciona o "objeto" despesa internacional compartilhada ao array de respectivas despesas.
         */
        $scope.addDespesaInternacionalCompartilhada = function() {
            $scope.despesa_internacional.brl = $scope.despesa_internacional.usd * $scope.config.cotacao_dolar; // Convertendo despesa internacional para brl.
            $scope.estudo.despesas.internacionais.compartilhadas.push($scope.despesa_internacional); // todo: Ver como "zerar" o objeto.
            $scope.despesa_internacional = {};
            totalizaDespesasInternacionais();
            processaMudancasTodosProdutos('despesas');
        };

        /**
         * Invoca o formulário modal em que o usuário vai informar o nome e o valor da despesa compartilhada.
         */
        $scope.addDespesaInternacionalDoProdutoModal = function(produto) {
            $scope.currentProduto = produto;
            let modalInstance = $uibModal.open({
                templateUrl: 'app/estudos/views/modals/adiciona-despesa-internacional-individual.modal.view.html',
                controller: ModalInstanceCtrl,
                scope: $scope,
                windowClass: 'animated flipInY'
            });
        };

        $scope.addDespesaInternacionalDoProduto = function() {
            let produto = $scope.currentProduto;
            $scope.despesa_internacional_produto.brl = $scope.despesa_internacional_produto.usd * $scope.config.cotacao_dolar; // Convertendo despesa internacional para brl.
            produto.estudo_do_produto.despesas.internacionais.individualizadas.push($scope.despesa_internacional_produto);
            $scope.despesa_internacional_produto = {};
            $scope.currentProduto = {};
            totalizaDespesasInternacionais();
            processaMudancasTodosProdutos('despesas');
        };

        /**
         * Adiciona objeto <estudo_do_produto> ao objeto <produto> e depois faz um push para adicionar <produto> no array $scope.produtosDoEstudo.
         * @param produto
         */
        $scope.adicionaProdutoEstudo = function(produto) { // todo: Renomear > Este nome não faz o menor sentido !!!!
            if ($scope.produtosDoEstudo.indexOf(produto) === -1){
                produto.estudo_do_produto = {
                    qtd: 0,
                    proporcionalidade: { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
                        fob: 0,
                        peso: 0,
                    },
                    custo_unitario: produto.custo_usd, // Não lembro o como funciona isso aqui.
                    fob: 0,
                    cif: 0,
                    frete_maritimo: {
                        valor: 0,
                        seguro: 0
                    },
                    medidas: {
                        peso: {
                            contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                            ocupado: 0,
                            ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                        },
                        volume: {
                            contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
                            ocupado: 0,
                            ocupado_percentual: 0
                        }
                    },
                    taxas: {
                        duty: 0,
                        mpf: 0,
                        hmf: 0,
                        total: 0
                    },
                    despesas: {
                        aduaneiras: [],
                        internacionais: { // Despesas originadas no exterior.
                            compartilhadas: [
                            //     { // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                            //     desc: '',
                            //     usd: 0,
                            //     brl: 0
                            // }
                            ],
                            individualizadas: [
                                // diluídas no PREÇO DO PRODUTO - Array com as despesas inerentes à cada produto.
                                // { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                                //     desc: '',
                                //     usd: 0,
                                //     brl: 0
                                // }
                            ],
                            totais: 0 // Somatório das despesas compartilhadas e individualizadas.
                        },
                        nacionais: { // Despesas originadas no exterior.
                            compartilhadas: 0, // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                            individualizadas: 0, // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                            totais: 0 // Somatório das despesas compartilhadas e individualizadas.
                        },
                        total: 0
                    },
                    resultados: {
                        investimento: 0,
                        lucro: 0,
                        roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                        comparacao: {
                            percentual_frete: 0,
                            percentual_fob: 0,
                            percentual_duties: 0,
                            percentual_mpf: 0,
                            percentual_hmf: 0,
                            percentual_despesas: 0,
                            percentual_taxas: 0
                        },
                        precos: {
                            custo: 0,
                            venda: 0
                        }
                    },
                };
                $scope.produtosDoEstudo.push(produto);
            }
        };

        $scope.removeProdutoEstudo = function(item) {
            $scope.produtosDoEstudo.splice($scope.produtosDoEstudo.indexOf(item), 1);
            $scope.iniImport();
        };

        /**
         * Ajusta os valores digitados na tabela do produto da página main-estudos.client.view.html
         * <custo_cheio> / <custo_paypal> / <custo_dentro> / <qtd> / <despesas>
         * @param produto - objeto <produto> proveniente da iteração ng-repeat pelos produtos adicionados ao estudo.
         * @param campo - string utilizada para designar qual é o campo que está sendo modificado.
         */
        $scope.processaMudancas = function(produto, campo) {

            totalizaDespesasInternacionais();
            auxProcessaMudancas(produto, campo);
            $scope.iniImport();

        };

        function auxProcessaMudancas (produto, campo) {
            // As letiáveis abaixo servem apenas para reduzir o tamanho dos nomes.
            // let aux = produto.estudo_do_produto;
            // let desp = aux.despesas.internacionais.totais;
            // let cUnit = produto.estudo_do_produto.custo_unitario;
            // let despUnit = 0;
            // if(aux.qtd > 0) {
            //     despUnit = desp.usd / aux.qtd;
            // }
            // let cCheio = produto.custo_usd + despUnit;
            // cUnit.cheio.usd = cCheio; // Este objeto é inicializado com o valor custo_usd do produto. Aqui ele é alterado para refletir o total inicial + as despesas do produto.
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
            //     case 'despesas':
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
         * Funçao provisória para testar se cada produto que tem seus valores alterados em algum campo da tabela de produtos apresenta o somatório de custos que compõe o preço final do ítem estão corretos.
         * todo: Apagar esta funçao assim que possível.
         * @param produto
         * @returns {boolean}
         */
        function testaSomatorioValoresProduto(produto) {
            let aux = produto.estudo_do_produto;
            let desp = aux.despesas.internacionais.individualizadas.usd;
            let cUnit = produto.estudo_do_produto.custo_unitario;
            let custo = produto.custo_usd;
            let despUnit = 0;
            if(aux.qtd > 0) {
                despUnit = desp / aux.qtd;
            }
            $scope.auxTestes = areEqual((custo + despUnit), (cUnit.cheio.usd), (cUnit.paypal.usd + cUnit.declarado.usd));
            return ((custo + despUnit) === (cUnit.cheio.usd) === (cUnit.paypal.usd + cUnit.declarado.usd));
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


        /**
         * Zera os campos totalizadores do objeto <produto.estudo_do_produto>.
         * Quando um produto tem sua quantidade reduzida para 0 em um estudo, estes totalizadores são zerados
         * para não interferirem no somatório do Estudo Geral.
         * @param produto
         */
        function zeraDadosEstudoDoProduto(produto) {
            // let despInternacionais = produto.estudo_do_produto.despesas;
            produto.estudo_do_produto = {
                qtd: 0,
                fob: 0,
                proporcionalidade: { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
                    fob: produto.estudo_do_produto.proporcionalidade.fob,
                    peso: produto.estudo_do_produto.proporcionalidade.fob,
                },
                custo_unitario: produto.estudo_do_produto.custo_unitario, // Essa atribuiçao é para manter a integridade "estrutural" do objeto..
                cif: 0,
                medidas: {
                    peso: {
                        contratado: 0, // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                        ocupado: 0,
                        ocupado_percentual: 0 // Por enquanto não vou usar esse valor > Só será usado quando importar um produto muito pesado.
                    },
                    volume: {
                        contratado: 0, // todo: Volume do Cntr escolhido para fazer o transporte da carga. Encontrar uma solução melhor para quando for trabalhar com outros volumes.
                        ocupado: 0,
                        ocupado_percentual: 0
                    }
                },
                frete_maritimo: {
                    valor: 0,
                    seguro: 0
                },
                taxas: {
                    duty: 0,
                    mpf: 0,
                    hmf: 0,
                    total: 0
                },
                despesas: {
                    aduaneiras: 0,
                    internacionais: { // Despesas originadas no exterior.
                        compartilhadas: produto.estudo_do_produto.despesas.internacionais.compartilhadas,
                        individualizadas: produto.estudo_do_produto.despesas.internacionais.individualizadas,
                        totais: 0, // Somatório das despesas compartilhadas e individualizadas.
                    },
                    nacionais: { // Despesas originadas no exterior.
                        compartilhadas: 0, // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                        individualizadas: 0, // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                        totais: 0, // Somatório das despesas compartilhadas e individualizadas.
                    },
                    total: 0,
                },
                resultados: {
                    investimento: 0, // Campo que designa o somatório dos custos unitários
                    lucro: 0,
                    roi: 0, // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                    comparacao: {
                        percentual_frete: 0,
                        percentual_fob: 0,
                        percentual_duties: 0,
                        percentual_mpf: 0,
                        percentual_hmf: 0,
                        percentual_despesas: 0,
                        percentual_taxas: 0
                    },
                    precos: {
                        custo: 0,
                        venda: 0,
                    }
                },
            };
        }

        //region Etapas para cálculo do estudo - iniImp()
        // 1
        /**
         * Zera os valores de todos os acumuladores do objeto <$scope.estudo>
         */
        function zeraDadosEstudo() {

            $scope.estudo.fob = 0;
            $scope.estudo.cif = 0;
            $scope.estudo.taxas = {duty: 0, mpf: 0, hmf: 0, total: 0};

            $scope.estudo.totalPeso = 0; // todo: Descobrir para que serve
            $scope.estudo.volume_ocupado = 0; // todo: Descobrir para que serve

            $scope.estudo.despesas.total = 0;
            $scope.estudo.despesas.aduaneiras = [];

            $scope.estudo.medidas.peso = {contratado: 0, ocupado: 0, ocupado_percentual: 0};
            $scope.estudo.medidas.volume = {contratado: 0, ocupado: 0, ocupado_percentual: 0};

            $scope.estudo.resultados.investimento = 0;
            $scope.estudo.resultados.lucro = 0;
            $scope.estudo.resultados.roi = 0;

            $scope.estudo.resultados.comparacao.percentual_frete = 0;
            $scope.estudo.resultados.comparacao.percentual_fob = 0;
            $scope.estudo.resultados.comparacao.percentual_duties = 0;
            $scope.estudo.resultados.comparacao.percentual_mpf = 0;
            $scope.estudo.resultados.comparacao.percentual_hmf = 0;
            $scope.estudo.resultados.comparacao.percentual_despesas = 0;
            $scope.estudo.resultados.comparacao.percentual_taxas = 0;

        }

        function zeraDadosGrafico() {
            $scope.piePoints = [{"Frete": 0}, {"Fob": 0}, {"Despesas": 0}, {"Taxas": 0}];
        }

        // 2
        /**
         * Carrega o objeto <$scope.estudo> com os dados do <$scope.config>
         */
        function loadEstudoComDadosConfig() {

            $scope.estudo.frete_maritimo.valor = Number($scope.config.frete_maritimo);
            $scope.estudo.frete_maritimo.seguro = Number($scope.config.seguro_frete_maritimo);
            $scope.estudo.config.comissao_amazon = Number($scope.config.comissao_amazon);

            $scope.estudo.medidas.volume.contratado = Number($scope.config.volume_cntr_20);
            $scope.estudo.config.percentual_comissao_conny = Number($scope.config.percentual_comissao_conny);

            $scope.estudo.config.mpf = Number($scope.config.mpf);
            $scope.estudo.config.hmf = Number($scope.config.hmf);

        }

        // 3
        /**
         * Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
         */
        function setFobProdutos() {

            $scope.produtosDoEstudo.forEach(function (produto) {

                let custUnit = produto.estudo_do_produto.custo_unitario;
                let tx_conny = $scope.estudo.config.percentual_comissao_conny;
                let qtd = produto.estudo_do_produto.qtd;

                if (produto.estudo_do_produto.qtd <= 0) {
                    zeraDadosEstudoDoProduto(produto); // Zera os campos totalizadores do objeto <produto.estudo_do_produto>.
                }
                else
                {
                    produto.estudo_do_produto.fob = ((custUnit * (1 + tx_conny)) * qtd);
                }

            });

        }

        // 4
        /**
         * Itera produtos para totalizar dados do <$scope.estudo> como FOBs, Peso e Volume.
         */
        function totalizaDadosBasicosDoEstudo() {

            $scope.estudo.fob = 0;
            $scope.estudo.medidas.peso.ocupado = 0;
            $scope.estudo.medidas.volume.ocupado = 0;
            $scope.estudo.medidas.volume.ocupado_percentual = 0;

            $scope.produtosDoEstudo.forEach(function (produto) {

                if(produto.estudo_do_produto.qtd <= 0) {
                    zeraDadosEstudoDoProduto(produto);
                }
                else
                {
                    $scope.estudo.fob += ((produto.estudo_do_produto.custo_unitario * produto.estudo_do_produto.qtd) * (1 + $scope.config.percentual_comissao_conny)); // Calcula Fob
                    $scope.estudo.cif = $scope.estudo.fob + $scope.estudo.frete_maritimo.valor + $scope.estudo.frete_maritimo.seguro;
                    $scope.estudo.medidas.peso.ocupado += produto.medidas.peso * produto.estudo_do_produto.qtd; // Calcula peso total
                    $scope.estudo.medidas.volume.ocupado += produto.medidas.cbm * produto.estudo_do_produto.qtd; // Calcula volume ocupado no contêiner
                    $scope.estudo.medidas.volume.ocupado_percentual = ($scope.estudo.medidas.volume.ocupado / $scope.estudo.medidas.volume.contratado) * 100; // todo: Ajustar o controle para exibir o percentual correto pois aqui estou tendo que multiplicar por 100.
                }

            });
        }

        // 5
        /**
         * Itera pelo objeto <$scope.despesas> e faz o somatório para adicionar ao <$scope.estudo>
         */
        function totalizaDespesasDoEstudo() {

            let desp = $scope.estudo.despesas;

            $scope.despesas.forEach(function (item) {
                if(item.tipo === 'Valor' && item.ativa === true) {
                    desp.aduaneiras.push({
                        nome: item.nome,
                        valor: item.valor
                    });
                    desp.total += item.valor;
                }
            });

        }

        function totalizaDespesasInternacionaisDoProduto(produto) {
            let desp = produto.estudo_do_produto.despesas.internacionais;
            desp.totais = {usd: 0, brl: 0};
            for(let i = 0; i < desp.individualizadas; i++) {
                desp.totais += desp.individualizadas[i];
            }
        }

        // 6
        /**
         * Itera por cada produto de <$scope.ProdutosDoEstudo> para gerar um <estudo_do_produto> com os custos de importação individualizados e totalizar <$scope.estudo>.
         */
        function geraEstudoDeCadaProduto() {

            $scope.produtosDoEstudo.forEach(function (produto) {

                // Garante que o estudo somente seja realizado caso o produto iterado tenha quantidade maior que zero (problema de divisão por zero)
                if(produto.estudo_do_produto.qtd <= 0) {
                    zeraDadosEstudoDoProduto(produto);
                }
                else
                {
                    auxCalculaMedidasDeCadaProduto(produto);

                    let estProd = produto.estudo_do_produto; // Simplificando a letiável para reduzir o espaço e facilitar a leitura.

                    // Cálculos de Proporcionalidade
                    estProd.frete_maritimo.valor = estProd.medidas.peso.ocupado_percentual * $scope.estudo.frete_maritimo.valor; // Cálculo de Frete Marítimo proporcional.
                    estProd.frete_maritimo.seguro = estProd.medidas.peso.ocupado_percentual * $scope.estudo.frete_maritimo.seguro; // Cálculo de SEGURO de Frete Marítimo proporcional.
                    estProd.cif = estProd.fob + estProd.frete_maritimo.valor + estProd.frete_maritimo.seguro; // Cálculo CIFs (que é o mesmo que Valor Aduaneiro).

                    calculaTaxasProduto(produto);


                    // Cálculo do total de despesas proporcional do produto.
                    estProd.despesas.total = (estProd.cif / $scope.estudo.cif) * $scope.estudo.despesas.total; // Usar CIF ou FOB?

                    totalizaImpostosEstudo(produto);

                    calculaResultadosProduto(produto);

                    // Região para acumular os dados do Estudo
                    $scope.estudo.resultados.investimento += estProd.resultados.investimento;

                    // Update (soma) dos lucros dos produtos para formar o Lucro Total do Estudo.
                    $scope.estudo.resultados.lucro += estProd.resultados.lucro;

                    $scope.estudo.resultados.roi = $scope.estudo.resultados.lucro / $scope.estudo.resultados.investimento;

                    totalizaComparacoesEstudo(produto);

                    testeFees(produto);

                }

            });

        }

        function auxCalculaMedidasDeCadaProduto(produto) {

            if(produto.estudo_do_produto <= 0) {
                zeraDadosEstudoDoProduto(produto);
            }
            else
            {
                // Cálculo das medidas > Peso e Volume totais do produto.
                produto.estudo_do_produto.medidas.peso.ocupado = produto.medidas.peso * produto.estudo_do_produto.qtd;
                produto.estudo_do_produto.medidas.volume.ocupado = produto.medidas.cbm * produto.estudo_do_produto.qtd;

                // Cálculo dos percentuais > Peso e Volume proporcionais do produto
                produto.estudo_do_produto.medidas.peso.ocupado_percentual = produto.estudo_do_produto.medidas.peso.ocupado / $scope.estudo.medidas.peso.ocupado;
                produto.estudo_do_produto.medidas.volume.ocupado_percentual = produto.estudo_do_produto.medidas.volume.ocupado / $scope.estudo.medidas.volume.ocupado;
            }

        }

        function calculaTaxasProduto(produto) {

            let estProd = produto.estudo_do_produto;

            // Cálculo de Taxas e Impostos
            estProd.taxas.duty = produto.duty * estProd.fob; // Cálculo Duty Tax

            estProd.taxas.mpf = $scope.estudo.config.mpf * estProd.fob; // Cálculo MPF
            if(estProd.taxas.mpf < 35) {
                estProd.taxas.mpf = 35;
            } else if(estProd.taxas.mpf > 485) {
                estProd.taxas.mpf = 485;
            }


            estProd.taxas.hmf = $scope.estudo.config.hmf * estProd.fob; // Cálculo HMF
            estProd.taxas.total = estProd.taxas.duty + estProd.taxas.mpf + estProd.taxas.hmf; // Totaliza

        }

        function calculaResultadosProduto(produto) {

            let estProd = produto.estudo_do_produto; // Simplificando a letiável para reduzir o espaço e facilitar a leitura.

            estProd.resultados.investimento = (
                estProd.cif +
                estProd.taxas.total +
                estProd.despesas.total
            );

            // Cálculo do preço de Custo final do produto.
            estProd.resultados.precos.custo = estProd.resultados.investimento / estProd.qtd;

            // Calcula o resultado unitário e total de cada um dos produtos.
            estProd.resultados.lucro = ((estProd.resultados.precos.venda * (1 - $scope.estudo.config.comissao_amazon)) - estProd.resultados.precos.custo) * estProd.qtd;

            // Calcula o roi do produto.
            estProd.resultados.roi = estProd.resultados.lucro / estProd.resultados.investimento;

            // Calcula os percentuais de comparação entre os componentes do preço final do produto;
            estProd.resultados.comparacao.percentual_frete = estProd.frete_maritimo.valor / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_despesas = estProd.despesas.total / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_duties = estProd.taxas.duty / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_fob = estProd.cif / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_hmf = estProd.taxas.hmf / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_mpf = estProd.taxas.mpf / estProd.resultados.investimento;
            estProd.resultados.comparacao.percentual_taxas = estProd.taxas.total / estProd.resultados.investimento;

        }

        /**
         * Incrementa os totais dos tributos do estudo "geral" com base nos valores de cada produto passado como argumento.
         * @param produto
         */
        function totalizaImpostosEstudo(produto) {

            let estProduto = produto.estudo_do_produto;

            // Update (soma) dos valores dos impostos ao Estudo Geral.

            $scope.estudo.taxas.duty += estProduto.taxas.duty;
            $scope.estudo.taxas.mpf += estProduto.taxas.mpf;
            $scope.estudo.taxas.hmf += estProduto.taxas.hmf;
            $scope.estudo.taxas.total += estProduto.taxas.total

        }

        function totalizaComparacoesEstudo() {


            $scope.estudo.resultados.comparacao.percentual_frete = $scope.estudo.frete_maritimo.valor / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_hmf = $scope.estudo.taxas.hmf / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_despesas = $scope.estudo.despesas.total / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_duties = $scope.estudo.taxas.duty / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_fob = $scope.estudo.fob / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_mpf = $scope.estudo.taxas.mpf / $scope.estudo.resultados.investimento;
            $scope.estudo.resultados.comparacao.percentual_taxas = $scope.estudo.taxas.total / $scope.estudo.resultados.investimento;

            $scope.piePoints = [
                {"Frete": $scope.estudo.resultados.comparacao.percentual_frete},
                {"Fob": $scope.estudo.resultados.comparacao.percentual_fob},
                {"Despesas": $scope.estudo.resultados.comparacao.percentual_despesas},
                {"Taxas": $scope.estudo.resultados.comparacao.percentual_taxas}
            ];

        }

        $scope.iniImport = function() {
            zeraDadosEstudo();
            zeraDadosGrafico();
            loadEstudoComDadosConfig();
            if($scope.produtosDoEstudo.length > 0)
            {
                setFobProdutos(); // Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
                totalizaDadosBasicosDoEstudo(); // Itera produtos para totalizar dados do <$scope.estudo> como FOBs, Peso e Volume.
                totalizaDespesasDoEstudo(); // Itera pelo objeto <$scope.despesas> e faz o somatório para adicionar ao <$scope.estudo>
                geraEstudoDeCadaProduto(); // Itera por cada produto de <$scope.ProdutosDoEstudo> para gerar um <estudo_do_produto> com os custos de importação individualizados e totalizar <$scope.estudo>.
                // $scope.comparaDados();
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

        function testeFees(produto) {
            produto.estudo_do_produto.resultados.precos.custo += AmazonMod.calculo(produto);
        }

    }
]);
