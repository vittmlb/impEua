/**
 * Created by Vittorio on 14/08/2016.
 */
var cidades = require('../controllers/cidades.server.controller');

module.exports = function(app) {

    app.route('/api/cidades')
        .get(cidades.list)
        .post(cidades.create);

    app.route('/api/cidades/:cidadeId')
        .get(cidades.read)
        .put(cidades.update)
        .delete(cidades.delete);

    app.param('cidadeId', cidades.findById);

};