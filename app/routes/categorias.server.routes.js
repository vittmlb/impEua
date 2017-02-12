/**
 * Created by Vittorio on 02/09/2016.
 */
var categorias = require('../controllers/categorias.server.controller');

module.exports = function(app) {

    app.route('/api/categorias')
        .get(categorias.list)
        .post(categorias.create);

    app.route('/api/categorias/:categoriaId')
        .get(categorias.read)
        .put(categorias.update)
        .delete(categorias.delete);

    app.param('categoriaId', categorias.findById);

};