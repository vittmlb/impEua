/**
 * Created by Vittorio on 26/02/2017.
 */

let estudo = {};

let z = {
    piePoints: [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}],
    pieColumns: [{"id": "Frete", "type": "pie"}, {"id": "Fob", "type": "pie"}, {"id": "Custos", "type": "pie"}, {"id": "Taxas", "type": "pie"}],
    colors: "#9cc3da, #a3e1d4, #1ab394, #67add9"
};

angular.module('estudos').factory('CompGraficos', function () {

    let piePoints = [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}];
    let pieColumns = [{"id": "Frete", "type": "pie"}, {"id": "Fob", "type": "pie"}, {"id": "Custos", "type": "pie"}, {"id": "Taxas", "type": "pie"}];

    function zeraGrafico() {
        piePoints = [{"Frete": 0}, {"Fob": 0}, {"Custos": 0}, {"Taxas": 0}];
    }

    function teste() {
        z.piePoints = [
            {"Frete": estudo.resultados.comparacao.percentual_frete()},
            {"Fob": estudo.resultados.comparacao.percentual_fob()},
            {"Custos": estudo.resultados.comparacao.percentual_custos()},
            {"Taxas": estudo.resultados.comparacao.percentual_taxas()}
        ];
    }

    return {
        set: {
            estudo: function (estudoObj) {
                estudo = estudoObj;
            }
        },
        teste: {
            a: function() {
                return piePoints;
            }
        },
        geral: function() {
            return z;
        },
        estudo: {
            geral: function () {
                teste();
                return piePoints;
            },
            zera: function () {
                zeraGrafico();
            }
        }
    };

});