/**
 * Created by Vittorio on 04/08/2016.
 */

let hscode = require('../controllers/hscode.server.controller.js');

module.exports = function(app) {

    app.route('/api/hscode')
        .get(hscode.list)
        .post(hscode.create);

    app.route('/api/hscode/:hsId')
        .get(hscode.read)
        .put(hscode.update)
        .delete(hscode.delete);

    app.param('hsId', hscode.findById);

};