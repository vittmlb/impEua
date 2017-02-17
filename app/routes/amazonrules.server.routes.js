/**
 * Created by Vittorio on 17/02/2017.
 */
let amazonRules = require('../controllers/amazonrules.server.controller.js');

module.exports = function(app) {

    app.route('/api/amazonRules')
        .get(amazonRules.list)
        .post(amazonRules.create);

    app.route('/api/amazonrules/:amazonruleId')
        .get(amazonRules.read)
        .put(amazonRules.update)
        .delete(amazonRules.delete);

    app.param('amazonruleId', amazonRules.findById);

};