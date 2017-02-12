/**
 * Created by Vittorio on 30/05/2016.
 */
var mongoose = require('./config/mongoose');
var express = require('./config/express');

var db = mongoose();
var app = express();

app.listen(3000);

module.exports = app;

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log(`Node app is running on port `, app.get('port'));
});