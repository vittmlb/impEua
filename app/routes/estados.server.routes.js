/**
 * Created by Vittorio on 14/08/2016.
 */
var estados = require('../controllers/estados.server.controller');

module.exports = function(app) {

    app.route('/api/estados')
        .get(estados.list)
        .post(estados.create);

    app.route('/api/estados/:estadoId')
        .get(estados.read)
        .put(estados.update)
        .delete(estados.delete);

    app.param('estadoId', estados.findById);

};