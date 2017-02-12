/**
 * Created by Vittorio on 13/08/2016.
 */

var fornecedores = require('../controllers/fornecedores.server.controller');

module.exports = function(app) {

    app.route('/api/fornecedores')
        .get(fornecedores.list)
        .post(fornecedores.create);

    app.route('/api/fornecedores/:fornecedorId')
        .get(fornecedores.read)
        .put(fornecedores.update)
        .delete(fornecedores.delete);

    app.param('fornecedorId', fornecedores.findById);

};