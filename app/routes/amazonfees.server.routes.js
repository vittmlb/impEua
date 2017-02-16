/**
 * Created by Vittorio on 15/02/2017.
 */
let amazonfees = require('../controllers/amazonfees.server.controller.js');

module.exports = function(app) {

    app.route('/api/amazonfees')
        .get(amazonfees.list)
        .post(amazonfees.create);

    app.route('/api/amazonfees/:amazonfeeId')
        .get(amazonfees.read)
        .put(amazonfees.update)
        .delete(amazonfees.delete);

    app.param('amazonfeeId', amazonfees.findById);

};