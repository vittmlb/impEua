/**
 * Created by Vittorio on 17/02/2017.
 */
let amazonRules = require('../controllers/amazonrules.server.controller.js');

module.exports = function(app) {

    app.route('/api/amazonrules')
        .get(amazonRules.list)
        .post(amazonRules.create);

    app.route('/api/amazonrules/:amazonruleId')
        .get(amazonRules.read)
        .put(amazonRules.update)
        .delete(amazonRules.delete);

    app.route('/api/amazonrules/:tiposetId')
        .get(amazonRules.read);

    app.param('amazonruleId', amazonRules.findById);
    app.param('tiposetId', amazonRules.findByTipoSet);

};