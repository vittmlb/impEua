/**
 * Created by Vittorio on 27/07/2016.
 */

var uploadFiles = require('../controllers/upload-files.server.controller');

module.exports = function(app) {

    app.route('/api/uploadimages/produtos')
        .post(uploadFiles.uploadImagemProduto);

};