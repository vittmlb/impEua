/**
 * Created by Vittorio on 14/02/2017.
 */
let embalagens = require('../controllers/embalagens.server.controller');

module.exports = function(app) {

    app.route('/api/embalagens')
        .get(embalagens.list)
        .post(embalagens.create);

    app.route('/api/embalagens/:embalagemId')
        .get(embalagens.read)
        .put(embalagens.update)
        .delete(embalagens.delete);

    app.param('embalagemId', embalagens.findById);

};