var app = require('express')();
var request = require('request');
var _ = require('underscore');
var jsonStream = require('JSONStream');
var MongoClient = require('mongodb').MongoClient;
var uriUtil = require('./uri-query-utils.js');

var key = "44b37d42-2e7e-4006-8f65-34b8ef8ca591";

var db;

app.get("/api/lol/*", function (req, res) {
    var url = "https://na.api.pvp.net";
    url += req.path + uriUtil.addQuery(_.extend({api_key: key}, req.query));
    checkMongo(url, req, res);
});


var checkMongo = function(url, req, res) {
    var collection = db.collection('lol_data');

    collection.findOne({"url": url}, function (err, item) {
        if (err) throw err;
        if (item) {
            console.log(item);
            res.send(item.data);
        }
        else {
            console.log('nothing in the cache');
            req.pipe(request(url)).pipe(res);
        }

    });
}

MongoClient.connect('mongodb://127.0.0.1:27017/test', function (err, databaseConnection) {
    if (err) throw err;

    db = databaseConnection;


});


app.listen(1337);

console.log('server running at localhost:1337');

