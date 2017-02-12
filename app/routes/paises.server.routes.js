/**
 * Created by Vittorio on 13/08/2016.
 */
var paises = require('../controllers/paises.server.controller');

module.exports = function(app) {

    app.route('/api/paises')
        .get(paises.list)
        .post(paises.create);

    app.route('/api/paises/:paisId')
        .get(paises.read)
        .put(paises.update)
        .delete(paises.delete);

    app.param('paisId', paises.findById);

};