/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('estudos').controller('EstudosController', ['$scope', '$uibModal', '$routeParams', '$location', 'Produtos', 'Despesas', 'Estudos', '$http', '$stateParams', 'toaster',
    function($scope, $uibModal, $routeParams, $location, Produtos, Despesas, Estudos, $http, $stateParams, toaster) {

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
            cotacao_dolar: 0,
            cotacao_dolar_paypal: 0,
            config: {
                taxa_paypal: 0,
                iof_cartao: 0,
                comissao_ml: 0,
                aliquota_simples: 0,
                percentual_comissao_conny: 0
            },
            total_comissao_conny_usd: 0, // todo: Implementar comissão Conny
            total_comissao_conny_brl: 0,
            fob: {
                declarado: { // FOB que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                    usd: 0,
                    brl: 0
                },
                cheio: { // FOB real, como se o processo fosse feito integralmente por dentro (sem paypal)
                    usd: 0,
                    brl: 0
                }
            },
            cif: {
                declarado: { // CIF que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                    usd: 0,
                    brl: 0
                },
                cheio: { // CIF real, como se o processo fosse feito integralmente por dentro (sem paypal)
                    usd: 0,
                    brl: 0
                }
            },
            frete_maritimo: {
                valor: {
                    usd: 0,
                    brl: 0
                },
                seguro: {
                    usd: 0,
                    brl: 0
                }
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
            aliq_icms: 0.18, // todo: Carregar esta informação à partir do objeto despesas.
            tributos: {
                declarado: { // Tributos que constarão da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                    ii: {
                        usd: 0,
                        brl: 0
                    },
                    ipi: {
                        usd: 0,
                        brl: 0
                    },
                    pis: {
                        usd: 0,
                        brl: 0
                    },
                    cofins: {
                        usd: 0,
                        brl: 0
                    },
                    icms: {
                        usd: 0,
                        brl: 0
                    },
                    total: {
                        usd: 0,
                        brl: 0
                    }
                },
                cheio: { // Tributaçao real, como se o processo fosse feito integralmente por dentro (sem paypal). Seria o total de impostos a pagar se não houvesse sonegação
                    ii: {
                        usd: 0,
                        brl: 0
                    },
                    ipi: {
                        usd: 0,
                        brl: 0
                    },
                    pis: {
                        usd: 0,
                        brl: 0
                    },
                    cofins: {
                        usd: 0,
                        brl: 0
                    },
                    icms: {
                        usd: 0,
                        brl: 0
                    },
                    total: {
                        usd: 0,
                        brl: 0
                    }
                }
            },
            despesas: {
                afrmm: {
                    usd: 0,
                    brl: 0
                }, // todo: Não tem qualquer utilidade. Serve apenas para comparar se os cálculos estão corretos. Encontrar nova forma de fazer isso e elimitar isso daqui.
                aduaneiras: {
                    usd: 0,
                    brl: 0
                },
                internacionais: { // Despesas originadas no exterior.
                    compartilhadas: [],
                    // compartilhadas: [{ // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                    //     desc: '',
                    //     usd: 0,
                    //     brl: 0
                    // }],
                    individualizadas: { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                        usd: 0,
                        brl: 0
                    },
                    totais: { // Despesas internacionais totais - Somatório das despesas compartilhadas com as individualizadas
                        usd: 0,
                        brl: 0
                    }
                },
                nacionais: {
                    compartilhadas: {
                        usd: 0,
                        brl: 0
                    },
                    individualizadas: {
                        usd: 0,
                        brl: 0
                    }
                },
                total: {
                    usd: 0,
                    brl: 0
                }
            },
            resultados: {
                investimento: {
                    declarado: { // Investimento que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                        usd: 0,
                        brl: 0
                    },
                    paypal: { // Investimento feito através do paypal
                        usd: 0,
                        brl: 0,
                        taxa_iof: { // Montante pago em IOF > não é a alíquota.
                            usd: 0,
                            brl: 0,
                        },
                        taxa_paypal: { // Montante pago em IOF > não é a alíquota.
                            usd: 0,
                            brl: 0,
                        },
                        taxa_conny: { // Montante pago em IOF > não é a alíquota.
                            usd: 0,
                            brl: 0,
                        }
                    },
                    final: { // Montante EFETIVAMENTE desembolsado para a aquisiçao do produto > declarado + paypal
                        brl: 0
                    },
                    cheio: { // Montante que teria sido investido se o processo fosse feito integralmente por dentro (sem paypal)
                        brl: 0
                    }
                },
                lucro: {
                    final: { // Lucro real obtido na operação, contemplando os gastos declarados e o total enviado através do paypal
                        usd: 0,
                        brl: 0
                    }
                },
                roi: { // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                    brl: 0
                }
            },
        };
        $scope.config = {
            cotacao_dolar: 0,
            cotacao_dolar_paypal: 0,
            volume_cntr_20: 0,
            iof_cartao: 0,
            taxa_paypal: 0,
            frete_maritimo_usd: 0,
            seguro_frete_maritimo_usd: 0,
            comissao_ml: 0,
            aliquota_simples: 0,
            percentual_comissao_conny: 0
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
                    _fob += prod.estudo_do_produto.custo_unitario.cheio.usd * prod.estudo_do_produto.qtd;
                    _peso += prod.peso * prod.estudo_do_produto.qtd;
                }
            });
            $scope.produtosDoEstudo.forEach(function (prod) {
                if(prod.estudo_do_produto.qtd > 0 && _fob > 0) {
                    prod.estudo_do_produto.proporcionalidade.fob = (prod.estudo_do_produto.custo_unitario.cheio.usd * prod.estudo_do_produto.qtd) / _fob;
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
                    memoria_paypal: 0, // Variável para armazenar o valor que é digitado para entrar como montante a ser pago pelo paypal. todo: Jogar para fob.paypal e usar .usd
                    qtd: 0,
                    proporcionalidade: { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
                        fob: 0,
                        peso: 0,
                    },
                    custo_unitario: {
                        declarado: { // Custo que constará da Invoice, ou seja, será o custo declarado para o governo, mas não contemplará o montante enviado por paypal
                            usd: produto.custo_usd,
                            brl: 0
                        },
                        paypal: { // Montante do Custo do produto pago através do paypal
                            usd: 0,
                            brl: 0
                        },
                        cheio: { // Montante que teria sido investido se o processo fosse feito integralmente por dentro (sem paypal)
                            usd: produto.custo_usd,
                            brl: 0
                        }
                    },
                    fob: {
                        declarado: { // FOB que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                            usd: 0,
                            brl: 0
                        },
                        cheio: { // FOB real, como se o processo fosse feito integralmente por dentro (sem paypal)
                            usd: 0,
                            brl: 0
                        },
                        paypal: {
                            usd: 0,
                            brl: 0,
                            taxa_iof: {
                                usd: 0,
                                brl: 0,
                            },
                            taxa_paypal: {
                                usd: 0,
                                brl: 0,
                            },
                            taxa_conny: {
                                usd: 0,
                                brl: 0,
                            }
                        }
                    },
                    cif: {
                        declarado: { // CIF que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                            usd: 0,
                            brl: 0
                        },
                        cheio: { // CIF real, como se o processo fosse feito integralmente por dentro (sem paypal)
                            usd: 0,
                            brl: 0
                        }
                    },
                    frete_maritimo: {
                        valor: {
                            usd: 0,
                            brl: 0
                        },
                        seguro: {
                            usd: 0,
                            brl: 0
                        }
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
                    tributos: {
                        declarado: { // Tributos que constarão da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                            ii: {
                                usd: 0,
                                brl: 0
                            },
                            ipi: {
                                usd: 0,
                                brl: 0
                            },
                            pis: {
                                usd: 0,
                                brl: 0
                            },
                            cofins: {
                                usd: 0,
                                brl: 0
                            },
                            icms: {
                                usd: 0,
                                brl: 0
                            },
                            total: {
                                usd: 0,
                                brl: 0
                            }
                        },
                        cheio: { // Tributaçao real, como se o processo fosse feito integralmente por dentro (sem paypal). Seria o total de impostos a pagar se não houvesse sonegação
                            ii: {
                                usd: 0,
                                brl: 0
                            },
                            ipi: {
                                usd: 0,
                                brl: 0
                            },
                            pis: {
                                usd: 0,
                                brl: 0
                            },
                            cofins: {
                                usd: 0,
                                brl: 0
                            },
                            icms: {
                                usd: 0,
                                brl: 0
                            },
                            total: {
                                usd: 0,
                                brl: 0
                            }
                        }
                    },
                    despesas: {
                        aduaneiras: {
                            usd: 0,
                            brl: 0
                        },
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
                            totais: { // Somatório das despesas compartilhadas e individualizadas.
                                usd: 0,
                                brl: 0
                            }
                        },
                        nacionais: { // Despesas originadas no exterior.
                            compartilhadas: { // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                                usd: 0,
                                brl: 0
                            },
                            individualizadas: { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                                usd: 0,
                                brl: 0
                            },
                            totais: { // Somatório das despesas compartilhadas e individualizadas.
                                usd: 0,
                                brl: 0
                            }
                        },
                        total: {
                            usd: 0,
                            brl: 0
                        }
                    },
                    resultados: {
                        investimento: { // Campo que designa o somatório dos custos unitários
                            declarado: { // Investimento que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                                usd: 0,
                                brl: 0
                            },
                            paypal: { // Investimento feito através do paypal
                                usd: 0,
                                brl: 0
                            },
                            final: { // Montante EFETIVAMENTE desembolsado para a aquisiçao do produto > declarado + paypal
                                brl: 0
                            },
                            cheio: { // Montante que teria sido investido se o processo fosse feito integralmente por dentro (sem paypal)
                                brl: 0
                            }
                        },
                        lucro: {
                            unitario: { // Lucro real obtido na venda de CADA produto
                                brl: 0
                            },
                            total: { // Lucro real obtido na venda de TODOS os produtos
                                brl: 0
                            },
                        },
                        roi: { // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                            brl: 0
                        },
                        precos: {
                            custo: {
                                declarado: { // Preço de custo unitário baseado apenas no valor declarado - Não incluirá o montante enviado através do paypal
                                    usd: 0,
                                    brl: 0
                                },
                                paypal: { // Preço de custo unitário baseado apenas no valor enviado através do paypal, bem como nas taxas correspondentes
                                    usd: 0,
                                    brl: 0
                                },
                                final: { // Preço de custo unitário REAL (valor que o produto efetivamente custou ao final do processo), incluindo o declarado e paypal
                                    brl: 0
                                },
                                cheio: { // Preço de custo unitário do produto se toda a operação fosse feita "por dentro", sem envio de dinheiro pelo paypal
                                    brl: 0
                                }
                            },
                            venda: {
                                brl: 0
                            }
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
            let aux = produto.estudo_do_produto;
            let desp = aux.despesas.internacionais.totais;
            let cUnit = produto.estudo_do_produto.custo_unitario;
            let despUnit = 0;
            if(aux.qtd > 0) {
                despUnit = desp.usd / aux.qtd;
            }
            let cCheio = produto.custo_usd + despUnit;
            cUnit.cheio.usd = cCheio; // Este objeto é inicializado com o valor custo_usd do produto. Aqui ele é alterado para refletir o total inicial + as despesas do produto.
            switch (campo) {
                case 'custo_paypal':
                    produto.estudo_do_produto.memoria_paypal = cUnit.paypal.usd;
                    cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
                    break;
                case 'custo_dentro':
                    cUnit.paypal.usd = cCheio - cUnit.declarado.usd;
                    break;
                case 'qtd':
                    cUnit.paypal.usd = produto.estudo_do_produto.memoria_paypal + despUnit;
                    cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
                    break;
                case 'despesas':
                    cUnit.paypal.usd = produto.estudo_do_produto.memoria_paypal + despUnit;
                    cUnit.declarado.usd = cCheio - cUnit.paypal.usd;
                    break;
            }
            testaSomatorioValoresProduto(produto);
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
                fob: {
                    declarado: { // FOB que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                        usd: 0,
                        brl: 0
                    },
                    cheio: { // FOB real, como se o processo fosse feito integralmente por dentro (sem paypal)
                        usd: 0,
                        brl: 0
                    },
                    paypal: {
                        usd: 0,
                        brl: 0,
                        taxa_iof: {
                            usd: 0,
                            brl: 0,
                        },
                        taxa_paypal: {
                            usd: 0,
                            brl: 0,
                        },
                        taxa_conny: {
                            usd: 0,
                            brl: 0,
                        }
                    }
                },
                memoria_paypal: produto.estudo_do_produto.memoria_paypal,
                proporcionalidade: { // exibe a proporcionalidade do produto no estudo, de acordo com cada uma das letiáveis em questão.
                    fob: produto.estudo_do_produto.proporcionalidade.fob,
                    peso: produto.estudo_do_produto.proporcionalidade.fob,
                },
                custo_unitario: produto.estudo_do_produto.custo_unitario, // Essa atribuiçao é para manter a integridade "estrutural" do objeto..
                paypal: {
                    usd: 0,
                    brl: 0,
                    taxa_iof: {
                        usd: 0,
                        brl: 0,
                    },
                    taxa_paypal: {
                        usd: 0,
                        brl: 0,
                    },
                    taxa_conny: {
                        usd: 0,
                        brl: 0,
                    }
                },
                cif: {declarado: {usd: 0, brl: 0}, cheio: {usd: 0, brl: 0}},
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
                    valor: {
                        usd: 0,
                        brl: 0
                    },
                    seguro: {
                        usd: 0,
                        brl: 0
                    }
                },
                tributos: {
                    declarado: {
                        ii: {
                            usd: 0,
                            brl: 0
                        },
                        ipi: {
                            usd: 0,
                            brl: 0
                        },
                        pis: {
                            usd: 0,
                            brl: 0
                        },
                        cofins: {
                            usd: 0,
                            brl: 0
                        },
                        icms: {
                            usd: 0,
                            brl: 0
                        },
                        total: {
                            usd: 0,
                            brl: 0
                        }
                    },
                    cheio: {
                        ii: {
                            usd: 0,
                            brl: 0
                        },
                        ipi: {
                            usd: 0,
                            brl: 0
                        },
                        pis: {
                            usd: 0,
                            brl: 0
                        },
                        cofins: {
                            usd: 0,
                            brl: 0
                        },
                        icms: {
                            usd: 0,
                            brl: 0
                        },
                        total: {
                            usd: 0,
                            brl: 0
                        }
                    }
                },
                despesas: {
                    aduaneiras: {
                        usd: 0,
                        brl: 0
                    },
                    internacionais: { // Despesas originadas no exterior.
                        compartilhadas: produto.estudo_do_produto.despesas.internacionais.compartilhadas,
                        individualizadas: produto.estudo_do_produto.despesas.internacionais.individualizadas,
                        totais: { // Somatório das despesas compartilhadas e individualizadas.
                            usd: 0,
                            brl: 0
                        }
                    },
                    nacionais: { // Despesas originadas no exterior.
                        compartilhadas: { // Despesas a serem compartilhadas por todos os produtos (como viagem da Conny para acompanhar o carregamento do contêiner).
                            usd: 0,
                            brl: 0
                        },
                        individualizadas: { // Despesas internacionais que dizem respeito a um único produto (viagem Conny para um fabricante, ou frete do produto para o porto.
                            usd: 0,
                            brl: 0
                        },
                        totais: { // Somatório das despesas compartilhadas e individualizadas.
                            usd: 0,
                            brl: 0
                        }
                    },
                    total: {
                        usd: 0,
                        brl: 0
                    }
                },
                resultados: {
                    investimento: { // Campo que designa o somatório dos custos unitários
                        declarado: { // Investimento que constará da Invoice, ou seja, será o total declarado para o governo, mas não contemplará o montante enviado por paypal
                            usd: 0,
                            brl: 0
                        },
                        paypal: { // Investimento feito através do paypal
                            usd: 0,
                            brl: 0
                        },
                        final: { // Montante EFETIVAMENTE desembolsado para a aquisiçao do produto > declarado + paypal
                            brl: 0
                        },
                        cheio: { // Montante que teria sido investido se o processo fosse feito integralmente por dentro (sem paypal)
                            brl: 0
                        }
                    },
                    lucro: {
                        unitario: { // Lucro real obtido na venda de CADA produto
                            brl: 0
                        },
                        total: { // Lucro real obtido na venda de TODOS os produtos
                            brl: 0
                        },
                    },
                    roi: { // ROI: Retorno Sobre Investimento > Lucro BRL / Investimento BRL
                        brl: 0
                    },
                    precos: {
                        custo: {
                            declarado: { // Preço de custo unitário baseado apenas no valor declarado - Não incluirá o montante enviado através do paypal
                                usd: 0,
                                brl: 0
                            },
                            paypal: { // Preço de custo unitário baseado apenas no valor enviado através do paypal, bem como nas taxas correspondentes
                                usd: 0,
                                brl: 0
                            },
                            final: { // Preço de custo unitário REAL (valor que o produto efetivamente custou ao final do processo), incluindo o declarado e paypal
                                brl: 0
                            },
                            cheio: { // Preço de custo unitário do produto se toda a operação fosse feita "por dentro", sem envio de dinheiro pelo paypal
                                brl: 0
                            }
                        },
                        venda: {
                            brl: 0
                        }
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

            $scope.estudo.fob = {declarado: {usd: 0, brl: 0}, cheio: {usd: 0, brl: 0}};
            $scope.estudo.cif = {declarado: {usd: 0, brl: 0}, cheio: {usd: 0, brl: 0}};

            $scope.estudo.totalPaypal = 0; // todo: Descobrir para que serve
            $scope.estudo.totalPeso = 0; // todo: Descobrir para que serve
            $scope.estudo.volume_ocupado = 0; // todo: Descobrir para que serve

            $scope.estudo.tributos.declarado = {ii: {usd: 0, brl: 0}, ipi: {usd: 0, brl: 0}, pis: {usd: 0, brl: 0}, cofins: {usd: 0, brl: 0}, icms: {usd: 0, brl: 0}, total: {usd: 0, brl: 0}};
            $scope.estudo.tributos.cheio = {ii: {usd: 0, brl: 0}, ipi: {usd: 0, brl: 0}, pis: {usd: 0, brl: 0}, cofins: {usd: 0, brl: 0}, icms: {usd: 0, brl: 0}, total: {usd: 0, brl: 0}};

            $scope.estudo.despesas.total.brl = 0;
            $scope.estudo.despesas.afrmm.brl = 0;

            $scope.estudo.medidas.peso = {contratado: 0, ocupado: 0, ocupado_percentual: 0};
            $scope.estudo.medidas.volume = {contratado: 0, ocupado: 0, ocupado_percentual: 0};

            $scope.estudo.resultados.investimento = {declarado: {usd: 0, brl: 0}, paypal: {usd: 0, brl: 0, taxa_iof: {usd: 0, brl: 0}, taxa_paypal: {usd: 0, brl: 0}, taxa_conny: {usd: 0, brl: 0} }, final: {brl: 0}, cheio: {brl: 0}};
            $scope.estudo.resultados.lucro = {final: {usd: 0, brl: 0}};
            $scope.estudo.resultados.roi = {brl: 0};

        }

        // 2
        /**
         * Carrega o objeto <$scope.estudo> com os dados do <$scope.config>
         */
        function loadEstudoComDadosConfig() {

            $scope.estudo.cotacao_dolar = Number($scope.config.cotacao_dolar);
            $scope.estudo.cotacao_dolar_paypal = Number($scope.config.cotacao_dolar_paypal);

            $scope.estudo.frete_maritimo.valor.usd = Number($scope.config.frete_maritimo_usd);
            $scope.estudo.frete_maritimo.valor.brl = Number($scope.estudo.frete_maritimo.valor.usd * $scope.estudo.cotacao_dolar);

            $scope.estudo.config.taxa_paypal = Number($scope.config.taxa_paypal);
            $scope.estudo.config.iof_cartao = Number($scope.config.iof_cartao);
            $scope.estudo.config.comissao_ml = Number($scope.config.comissao_ml);
            $scope.estudo.config.aliquota_simples = Number($scope.config.aliquota_simples);

            $scope.estudo.frete_maritimo.seguro.usd = Number($scope.config.seguro_frete_maritimo_usd);
            $scope.estudo.frete_maritimo.seguro.brl = $scope.estudo.frete_maritimo.seguro.usd * $scope.estudo.cotacao_dolar;

            $scope.estudo.medidas.volume.contratado = Number($scope.config.volume_cntr_20);

            $scope.estudo.config.percentual_comissao_conny = Number($scope.config.percentual_comissao_conny);

        }

        // 3
        /**
         * Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
         */
        function setFobProdutos() {

            $scope.produtosDoEstudo.forEach(function (produto) {

                let fob = produto.estudo_do_produto.fob;
                let custUnit = produto.estudo_do_produto.custo_unitario;
                let tx_conny = $scope.estudo.config.percentual_comissao_conny;
                let tx_iof = $scope.estudo.config.iof_cartao;
                let tx_paypal = $scope.estudo.config.taxa_paypal;
                let qtd = produto.estudo_do_produto.qtd;

                if (produto.estudo_do_produto.qtd <= 0) {
                    zeraDadosEstudoDoProduto(produto); // Zera os campos totalizadores do objeto <produto.estudo_do_produto>.
                }
                else
                {
                    fob.declarado.usd = ((custUnit.declarado.usd * (1 + tx_conny)) * qtd);
                    fob.declarado.brl = fob.declarado.usd * $scope.estudo.cotacao_dolar;


                    let aux_conny = ((custUnit.paypal.usd) * (tx_conny));
                    fob.paypal.taxa_conny.usd = aux_conny * qtd;
                    fob.paypal.taxa_conny.brl = fob.paypal.taxa_conny.usd * $scope.config.cotacao_dolar_paypal;

                    let aux_paypal = ((custUnit.paypal.usd + aux_conny) * (tx_paypal));
                    fob.paypal.taxa_paypal.usd = aux_paypal * qtd;
                    fob.paypal.taxa_paypal.brl = fob.paypal.taxa_paypal.usd * $scope.config.cotacao_dolar_paypal;

                    fob.paypal.taxa_iof.usd = ((custUnit.paypal.usd + aux_conny + aux_paypal) * (tx_iof)) * qtd;
                    fob.paypal.taxa_iof.brl = fob.paypal.taxa_iof.usd * $scope.config.cotacao_dolar_paypal;

                    fob.paypal.usd = (((((custUnit.paypal.usd) * (1 + tx_conny)) * qtd) * (1 + $scope.estudo.config.taxa_paypal)) * (1 + $scope.estudo.config.iof_cartao));
                    fob.paypal.brl = fob.paypal.usd * $scope.estudo.cotacao_dolar_paypal;

                    fob.cheio.usd = ((custUnit.cheio.usd) * (1 + tx_conny)) * qtd;
                    fob.cheio.brl = fob.cheio.usd * $scope.estudo.cotacao_dolar;
                }

            });

        }

        // 4
        /**
         * Itera produtos para totalizar dados do <$scope.estudo> como FOBs, Peso e Volume.
         */
        function totalizaDadosBasicosDoEstudo() {

            $scope.estudo.fob.declarado.usd = 0;
            $scope.estudo.fob.declarado.brl = 0;
            $scope.estudo.fob.cheio.usd = 0;
            $scope.estudo.fob.cheio.brl = 0;
            $scope.estudo.medidas.peso.ocupado = 0;
            $scope.estudo.medidas.volume.ocupado = 0;
            $scope.estudo.medidas.volume.ocupado_percentual = 0;

            $scope.produtosDoEstudo.forEach(function (produto) {

                if(produto.estudo_do_produto.qtd <= 0) {
                    zeraDadosEstudoDoProduto(produto);
                }
                else
                {

                    $scope.estudo.fob.declarado.usd += produto.estudo_do_produto.custo_unitario.declarado.usd * produto.estudo_do_produto.qtd * (1 + $scope.config.percentual_comissao_conny); // Calcula Fob
                    $scope.estudo.fob.declarado.brl += $scope.estudo.fob.declarado.usd * $scope.estudo.cotacao_dolar;

                    $scope.estudo.fob.cheio.usd += produto.estudo_do_produto.custo_unitario.cheio.usd * produto.estudo_do_produto.qtd * (1 + $scope.config.percentual_comissao_conny);
                    $scope.estudo.fob.cheio.brl += $scope.estudo.fob.cheio.usd * $scope.estudo.cotacao_dolar;

                    // $scope.estudo.totalPaypal += produto.estudo_do_produto.custo_unitario.paypal.usd * produto.estudo_do_produto.qtd; // todo: Ajustar a nomenclatura (totalPaypal não está em acordo com os demais nomes que usam '_').

                    $scope.estudo.medidas.peso.ocupado += produto.medidas.peso * produto.estudo_do_produto.qtd; // Calcula peso total
                    $scope.estudo.medidas.volume.ocupado += produto.medidas.cbm * produto.estudo_do_produto.qtd; // Calcula volume ocupado no contêiner
                    $scope.estudo.medidas.volume.ocupado_percentual = ($scope.estudo.medidas.volume.ocupado / $scope.estudo.medidas.volume.contratado) * 100; // todo: Ajustar o controle para exibir o percentual correto pois aqui estou tendo que multiplicar por 100.
                    
                }

            });
        }

        // 5
        /**
         * Seta os Valores CIF (usd/brl/integral) do objeto <$scope.estudo>
         */
        function setCifEstudo() {

            $scope.estudo.cif.declarado.usd = $scope.estudo.fob.declarado.usd + $scope.estudo.frete_maritimo.valor.usd + $scope.estudo.frete_maritimo.seguro.usd;
            $scope.estudo.cif.declarado.brl = $scope.estudo.cif.declarado.usd * $scope.estudo.cotacao_dolar;

            $scope.estudo.cif.cheio.usd = $scope.estudo.fob.cheio.usd + $scope.estudo.frete_maritimo.valor.usd + $scope.estudo.frete_maritimo.seguro.usd;
            $scope.estudo.cif.cheio.brl = $scope.estudo.cif.cheio.usd * $scope.estudo.cotacao_dolar;

        }

        // 6
        /**
         * Itera pelo objeto <$scope.despesas> e faz o somatório para adicionar ao <$scope.estudo>
         */
        function totalizaDespesasDoEstudo() {

            let desp = $scope.estudo.despesas;

            let aliqAfrmm = $scope.despesas.filter(function(item) {
                return item.nome === 'Taxa AFRMM'; // todo: Criar mecanismo de Erro quando não encontrar a taxa.
            });
            desp.afrmm.brl = $scope.estudo.frete_maritimo.valor.brl * aliqAfrmm[0].aliquota; //todo: Confirmar sobre a incidência do imposto (taxa de desembarque???)
            desp.afrmm.usd = desp.afrmm.brl * $scope.config.cotacao_dolar;

            // desp.total = Somatório de despesas aduaneiras + afrmm.
            desp.total.brl = desp.afrmm.brl; // Ao invés de iniciar as despesas com zero, já inicializo com o afrmm.
            $scope.despesas.forEach(function (item) {
                if(item.tipo === 'despesa aduaneira' && item.ativa === true) {
                    if(item.moeda === 'U$') {
                        desp.total.brl += (item.valor * $scope.estudo.cotacao_dolar);
                    } else {
                        desp.total.brl += item.valor;
                    }
                }
            });
            desp.total.usd = desp.total.brl * $scope.config.cotacao_dolar;

        }

        function totalizaDespesasInternacionaisDoProduto(produto) {
            let desp = produto.estudo_do_produto.despesas.internacionais;
            desp.totais = {usd: 0, brl: 0};
            for(let i = 0; i < desp.individualizadas; i++) {
                desp.totais.usd += desp.individualizadas[i].usd;
                desp.totais.brl += (desp.totais.usd * $scope.config.cotacao_dolar);
            }
        }

        // 7
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

                    // Cálculo de Frete Marítimo proporcional.
                    estProd.frete_maritimo.valor.usd = estProd.medidas.peso.ocupado_percentual * $scope.estudo.frete_maritimo.valor.usd;
                    estProd.frete_maritimo.valor.brl = estProd.frete_maritimo.valor.usd * $scope.estudo.cotacao_dolar;

                    // Cálculo de SEGURO de Frete Marítimo proporcional.
                    estProd.frete_maritimo.seguro.usd = estProd.medidas.peso.ocupado_percentual * $scope.estudo.frete_maritimo.seguro.usd;
                    estProd.frete_maritimo.seguro.brl = estProd.frete_maritimo.seguro.usd * $scope.estudo.cotacao_dolar;

                    // Cálculo CIFs (que é o mesmo que Valor Aduaneiro).
                    estProd.cif.declarado.usd = estProd.fob.declarado.usd + estProd.frete_maritimo.valor.usd + estProd.frete_maritimo.seguro.usd;
                    estProd.cif.declarado.brl = estProd.cif.declarado.usd * $scope.estudo.cotacao_dolar;
                    estProd.cif.cheio.usd = estProd.fob.cheio.usd + estProd.frete_maritimo.valor.usd + estProd.frete_maritimo.seguro.usd;
                    estProd.cif.cheio.brl = estProd.cif.cheio.usd * $scope.estudo.cotacao_dolar;

                    calculaImpostosProduto(produto); // Calcula todos os impostos do produto, que depois servirá de base para a totalização dos impostos do estudo.

                    totalizaDespesasDoProduto(produto);

                    totalizaImpostosEstudo(produto);

                    // Cálculo do Investimento (total = Declarado + paypal) a ser feito no produto.
                    estProd.resultados.investimento.final.brl = (
                        estProd.cif.declarado.brl +
                        estProd.fob.paypal.brl + // já considerando a taxa paypal e o IOF sobre compras internacionais do cartão
                        estProd.tributos.declarado.total.brl +
                        estProd.despesas.total.brl
                    );

                    estProd.resultados.investimento.cheio.brl = (
                        estProd.cif.cheio.brl +
                        estProd.tributos.cheio.total.brl +
                        estProd.despesas.total.brl
                    );

                    estProd.resultados.investimento.paypal.usd = estProd.fob.paypal.usd;
                    estProd.resultados.investimento.paypal.brl = estProd.fob.paypal.brl;


                    // Cálculo do preço de Custo final do produto.
                    estProd.resultados.precos.custo.final.brl = estProd.resultados.investimento.final.brl / estProd.qtd;
                    estProd.resultados.precos.custo.cheio.brl = estProd.resultados.investimento.cheio.brl / estProd.qtd;


                    // Calcula o resultado unitário e total de cada um dos produtos.
                    calculaResultadosPorProduto(produto);

                    // Região para acumular os dados do Estudo

                    $scope.estudo.resultados.investimento.final.brl += estProd.resultados.investimento.final.brl;
                    $scope.estudo.resultados.investimento.cheio.brl += estProd.resultados.investimento.cheio.brl;

                    $scope.estudo.resultados.investimento.paypal.usd += estProd.resultados.investimento.paypal.usd;
                    $scope.estudo.resultados.investimento.paypal.brl += estProd.resultados.investimento.paypal.brl;

                    // Totaliza os valores gastos com a taxa da Conny, obtidos à partir do estudo_do_produto.fob.paypal
                    $scope.estudo.resultados.investimento.paypal.taxa_conny.usd += estProd.fob.paypal.taxa_conny.usd;
                    $scope.estudo.resultados.investimento.paypal.taxa_conny.brl += estProd.fob.paypal.taxa_conny.brl;

                    // Totaliza os valores gastos com a taxa do Paypal, obtidos à partir do estudo_do_produto.fob.paypal
                    $scope.estudo.resultados.investimento.paypal.taxa_paypal.usd += estProd.fob.paypal.taxa_paypal.usd;
                    $scope.estudo.resultados.investimento.paypal.taxa_paypal.brl += estProd.fob.paypal.taxa_paypal.brl;

                    // Totaliza os valores gastos com IOF, obtidos à partir do estudo_do_produto.fob.paypal
                    $scope.estudo.resultados.investimento.paypal.taxa_iof.usd += estProd.fob.paypal.taxa_iof.usd;
                    $scope.estudo.resultados.investimento.paypal.taxa_iof.brl += estProd.fob.paypal.taxa_iof.brl;

                    $scope.estudo.resultados.investimento.declarado.usd += estProd.resultados.investimento.declarado.usd;
                    $scope.estudo.resultados.investimento.declarado.brl += estProd.resultados.investimento.declarado.brl;

                    // Update (soma) dos lucros dos produtos para formar o Lucro Total do Estudo.
                    $scope.estudo.resultados.lucro.final.brl += estProd.resultados.lucro.total.brl;

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

        /**
         * Função para cálculo dos impostos do Produto
         * Servirá como base para a totalização dos impostos do estudo "geral"
         * @param produto
         */
        function calculaImpostosProduto(produto) {

            let estProd = produto.estudo_do_produto; // Simplificando a letiável para reduzir o espaço e facilitar a leitura.

            // Cálculo dos Impostos - II.
            estProd.tributos.declarado.ii.usd = estProd.cif.declarado.usd * produto.impostos.ii;
            estProd.tributos.declarado.ii.brl = estProd.cif.declarado.brl * produto.impostos.ii;
            estProd.tributos.cheio.ii.usd = estProd.cif.cheio.usd * produto.impostos.ii;
            estProd.tributos.cheio.ii.brl = estProd.cif.cheio.brl * produto.impostos.ii;

            // Cálculo dos Impostos - IPI.
            estProd.tributos.declarado.ipi.usd = (estProd.cif.declarado.usd + estProd.tributos.declarado.ii.usd) * produto.impostos.ipi;
            estProd.tributos.declarado.ipi.brl = (estProd.cif.declarado.brl + estProd.tributos.declarado.ii.brl) * produto.impostos.ipi;
            estProd.tributos.cheio.ipi.usd = (estProd.cif.cheio.usd + estProd.tributos.cheio.ii.usd) * produto.impostos.ipi;
            estProd.tributos.cheio.ipi.brl = (estProd.cif.cheio.brl + estProd.tributos.cheio.ii.brl) * produto.impostos.ipi;

            // Cálculo dos Impostos - PIS.
            estProd.tributos.declarado.pis.usd = estProd.cif.declarado.usd * produto.impostos.pis;
            estProd.tributos.declarado.pis.brl = estProd.cif.declarado.brl * produto.impostos.pis;
            estProd.tributos.cheio.pis.usd = estProd.cif.cheio.usd * produto.impostos.pis;
            estProd.tributos.cheio.pis.brl = estProd.cif.cheio.brl * produto.impostos.pis;

            // Cálculo dos Impostos - Cofins.
            estProd.tributos.declarado.cofins.usd = estProd.cif.declarado.usd * produto.impostos.cofins;
            estProd.tributos.declarado.cofins.brl = estProd.cif.declarado.brl * produto.impostos.cofins;
            estProd.tributos.cheio.cofins.usd = estProd.cif.cheio.usd * produto.impostos.cofins;
            estProd.tributos.cheio.cofins.brl = estProd.cif.cheio.brl * produto.impostos.cofins;

            // Cálculo dos Impostos - ICMS.
            estProd.tributos.declarado.icms.usd = (((
                estProd.cif.declarado.usd +
                estProd.tributos.declarado.ii.usd +
                estProd.tributos.declarado.ipi.usd +
                estProd.tributos.declarado.pis.usd +
                estProd.tributos.declarado.cofins.usd) / (1 - $scope.estudo.aliq_icms)) * $scope.estudo.aliq_icms
            );

            estProd.tributos.declarado.icms.brl = (((
                estProd.cif.declarado.brl +
                estProd.tributos.declarado.ii.brl +
                estProd.tributos.declarado.ipi.brl +
                estProd.tributos.declarado.pis.brl +
                estProd.tributos.declarado.cofins.brl) / (1 - $scope.estudo.aliq_icms)) * $scope.estudo.aliq_icms
            );

            estProd.tributos.cheio.icms.usd = (((
                estProd.cif.cheio.usd +
                estProd.tributos.cheio.ii.usd +
                estProd.tributos.cheio.ipi.usd +
                estProd.tributos.cheio.pis.usd +
                estProd.tributos.cheio.cofins.usd) / (1 - $scope.estudo.aliq_icms)) * $scope.estudo.aliq_icms
            );

            estProd.tributos.cheio.icms.brl = (((
                estProd.cif.cheio.brl +
                estProd.tributos.cheio.ii.brl +
                estProd.tributos.cheio.ipi.brl +
                estProd.tributos.cheio.pis.brl +
                estProd.tributos.cheio.cofins.brl) / (1 - $scope.estudo.aliq_icms)) * $scope.estudo.aliq_icms
            );

            // Cálculo do total de tributos.
            estProd.tributos.declarado.total.usd = (
                estProd.tributos.declarado.ii.usd +
                estProd.tributos.declarado.ipi.usd +
                estProd.tributos.declarado.pis.usd +
                estProd.tributos.declarado.cofins.usd +
                estProd.tributos.declarado.icms.usd
            );

            estProd.tributos.declarado.total.brl = (
                estProd.tributos.declarado.ii.brl +
                estProd.tributos.declarado.ipi.brl +
                estProd.tributos.declarado.pis.brl +
                estProd.tributos.declarado.cofins.brl +
                estProd.tributos.declarado.icms.brl
            );

            estProd.tributos.cheio.total.usd = (
                estProd.tributos.cheio.ii.usd +
                estProd.tributos.cheio.ipi.usd +
                estProd.tributos.cheio.pis.usd +
                estProd.tributos.cheio.cofins.usd +
                estProd.tributos.cheio.icms.usd
            );

            estProd.tributos.cheio.total.brl = (
                estProd.tributos.cheio.ii.brl +
                estProd.tributos.cheio.ipi.brl +
                estProd.tributos.cheio.pis.brl +
                estProd.tributos.cheio.cofins.brl +
                estProd.tributos.cheio.icms.brl
            );

        }

        function totalizaDespesasDoProduto(produto) {

            let estProd = produto.estudo_do_produto; // Simplificando a letiável para reduzir o espaço e facilitar a leitura.

            // Cálculo do total de despesas proporcional do produto.
            estProd.despesas.total.brl = (estProd.cif.declarado.brl / $scope.estudo.cif.declarado.brl) * $scope.estudo.despesas.total.brl;
            estProd.despesas.total.usd = estProd.despesas.total.brl / $scope.estudo.cotacao_dolar; // todo: Definir se esta é a melhor forma de calcular este valor.

            estProd.despesas.internacionais.individualizadas.brl = estProd.despesas.internacionais.individualizadas.usd / $scope.config.cotacao_dolar; // todo: Usar estudo.cotação ou config.cotaçao???

        }

        /**
         * Incrementa os totais dos tributos do estudo "geral" com base nos valores de cada produto passado como argumento.
         * @param produto
         */
        function totalizaImpostosEstudo(produto) {

            let estProduto = produto.estudo_do_produto;

            // Update (soma) dos valores dos impostos ao Estudo Geral.

            $scope.estudo.tributos.declarado.ii.brl += estProduto.tributos.declarado.ii.brl;
            $scope.estudo.tributos.declarado.ipi.brl += estProduto.tributos.declarado.ipi.brl;
            $scope.estudo.tributos.declarado.pis.brl += estProduto.tributos.declarado.pis.brl;
            $scope.estudo.tributos.declarado.cofins.brl += estProduto.tributos.declarado.cofins.brl;
            $scope.estudo.tributos.declarado.icms.brl += estProduto.tributos.declarado.icms.brl;
            $scope.estudo.tributos.declarado.total.brl += estProduto.tributos.declarado.total.brl;

            $scope.estudo.tributos.cheio.ii.brl += estProduto.tributos.cheio.ii.brl;
            $scope.estudo.tributos.cheio.ipi.brl += estProduto.tributos.cheio.ipi.brl;
            $scope.estudo.tributos.cheio.pis.brl += estProduto.tributos.cheio.pis.brl;
            $scope.estudo.tributos.cheio.cofins.brl += estProduto.tributos.cheio.cofins.brl;
            $scope.estudo.tributos.cheio.icms.brl += estProduto.tributos.cheio.icms.brl;
            $scope.estudo.tributos.cheio.total.brl += estProduto.tributos.cheio.total.brl;

        }

        /**
         * Calcula os lucros unitário e total do produto passado como parâmetro, em brl.
         * @param produto
         */
        function calculaResultadosPorProduto(produto) {

            let estProd = produto.estudo_do_produto; // Simplificando a letiável para reduzir o espaço e facilitar a leitura.

            estProd.resultados.lucro.unitario.brl = (estProd.resultados.precos.venda.brl * (1 - $scope.estudo.config.aliquota_simples - $scope.estudo.config.comissao_ml)) - estProd.resultados.precos.custo.final.brl;
            estProd.resultados.lucro.total.brl = estProd.resultados.lucro.unitario.brl * estProd.qtd;
        }



        $scope.iniImport = function() {
            zeraDadosEstudo();
            loadEstudoComDadosConfig();
            if($scope.produtosDoEstudo.length > 0)
            {
                setFobProdutos(); // Itera por cada produto e seta os valores FOB (e letiáveis usd/brl/paypal/integral) <produto.estudo_do_produto.fob...>
                totalizaDadosBasicosDoEstudo(); // Itera produtos para totalizar dados do <$scope.estudo> como FOBs, Peso e Volume.
                setCifEstudo(); // Seta os Valores CIF (usd/brl/integral) do objeto <$scope.estudo>
                totalizaDespesasDoEstudo(); // Itera pelo objeto <$scope.despesas> e faz o somatório para adicionar ao <$scope.estudo>
                geraEstudoDeCadaProduto(); // Itera por cada produto de <$scope.ProdutosDoEstudo> para gerar um <estudo_do_produto> com os custos de importação individualizados e totalizar <$scope.estudo>.
                $scope.comparaDados();
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
