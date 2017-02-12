/**
 * Created by Vittorio on 15/08/2016.
 */
var estudos = require('../controllers/estudos.server.controller');

module.exports = function(app) {

    app.route('/api/estudos')
        .get(estudos.list)
        .post(estudos.create);

    app.route('/api/estudos/:estudoId')
        .get(estudos.read)
        .put(estudos.update)
        .delete(estudos.delete);

    app.param('estudoId', estudos.findById);

};