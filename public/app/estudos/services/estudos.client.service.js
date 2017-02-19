/**
 * Created by Vittorio on 30/05/2016.
 */
angular.module('estudos').factory('Estudos', ['$resource', function ($resource) {
    return $resource('/api/estudos/:estudoId', {
        estudoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

angular.module('estudos').factory('EstudosMod', ['Estudos', function (Estudos) {

    function auxZeraEstudo(estudo) {
        estudo.fob = 0;
        estudo.cif = 0;
        estudo.taxas = {duty: 0, mpf: 0, hmf: 0, total: 0};

        estudo.totalPeso = 0; // todo: Descobrir para que serve
        estudo.volume_ocupado = 0; // todo: Descobrir para que serve

        estudo.despesas.total = 0;
        estudo.despesas.aduaneiras = [];

        estudo.despesas.fba.fulfillment = 0;
        estudo.despesas.fba.inventory = 0;
        estudo.despesas.fba.placement = 0;

        estudo.medidas.peso = {contratado: 0, ocupado: 0, ocupado_percentual: 0};
        estudo.medidas.volume = {contratado: 0, ocupado: 0, ocupado_percentual: 0};

        estudo.resultados.investimento = 0;
        estudo.resultados.lucro = 0;
        estudo.resultados.roi = 0;

        estudo.resultados.comparacao.percentual_frete = 0;
        estudo.resultados.comparacao.percentual_fob = 0;
        estudo.resultados.comparacao.percentual_duties = 0;
        estudo.resultados.comparacao.percentual_mpf = 0;
        estudo.resultados.comparacao.percentual_hmf = 0;
        estudo.resultados.comparacao.percentual_despesas = 0;
        estudo.resultados.comparacao.percentual_taxas = 0;

        return 10;
    }

    function auxZeraDadosEstudoProduto(produto) {
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
                fba: {
                    fulfillment: 0,
                    inventory: 0,
                    placement: 0
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

    return {
        zeraEstudo: function(estudo) {
            auxZeraEstudo(estudo);
        },
        zeraDadosEstudoProduto: function(produto) {
            auxZeraDadosEstudoProduto(produto);
        }
    }

}]);