/**
 * Created by Vittorio on 01/06/2016.
 */
let custos = require('../controllers/custos.server.controller.js');

module.exports = function(app) {

    app.route('/api/custos')
        .get(custos.list)
        .post(custos.create);

    app.route('/api/custos/:custoId')
        .get(custos.read)
        .put(custos.update)
        .delete(custos.delete);

    app.param('custoId', custos.findById);
    
};