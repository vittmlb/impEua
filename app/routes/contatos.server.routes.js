/**
 * Created by Vittorio on 01/09/2016.
 */

var contatos = require('../controllers/contatos.server.controller');

module.exports = function(app) {

    app.route('/api/contatos')
        .get(contatos.list)
        .post(contatos.create);

    app.route('/api/contatos/:contatoId')
        .get(contatos.read)
        .put(contatos.update)
        .delete(contatos.delete);

    app.param('contatoId', contatos.findById);

};