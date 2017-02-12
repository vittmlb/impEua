/**
 * Created by Vittorio on 27/07/2016.
 */

var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/images/'));
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({storage: storage}).single('file');

exports.uploadImagemProduto = function(req, res) {
    upload(req, res, function (err) {
        if(err) {
            res.json({error_code: 1, err_desc: err});
        }
        res.json({error_code: 0, err_desc: null, file_path: req.file.filename});
    });
};