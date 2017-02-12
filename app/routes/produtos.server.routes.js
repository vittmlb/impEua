/**
 * Created by Vittorio on 30/05/2016.
 */
var produtos = require('../controllers/produtos.server.controller.js');

module.exports = function(app) {

    app.route('/api/produtos')
        .get(produtos.list)
        .post(produtos.create);

    app.route('/api/produtos/:produtoId')
        .get(produtos.read)
        .put(produtos.update)
        .delete(produtos.delete);


    app.param('produtoId', produtos.findById);
    
};