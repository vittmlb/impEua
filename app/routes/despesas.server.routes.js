/**
 * Created by Vittorio on 01/06/2016.
 */
var despesas = require('../controllers/despesas.server.controller');

module.exports = function(app) {

    app.route('/api/despesas')
        .get(despesas.list)
        .post(despesas.create);

    app.route('/api/despesas/:despesaId')
        .get(despesas.read)
        .put(despesas.update)
        .delete(despesas.delete);

    app.param('despesaId', despesas.findById);
    
};