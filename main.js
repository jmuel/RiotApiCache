var app = require('express')();
var request = require('request');
var _ = require('underscore');
var jsonStream = require('JSONStream');
var MongoClient = require('mongodb').MongoClient;
var uriUtil = require('./uri-query-utils.js');

var key = "44b37d42-2e7e-4006-8f65-34b8ef8ca591";

app.get("/api/lol/*", function(req, res) {
    var url = "https://na.api.pvp.net";
    url += req.path + uriUtil.addQuery(_.extend({api_key: key}, req.query));
    checkMongo(url);
    var temp = req.pipe(request(url));
    temp.pipe(res);
});



var checkMongo = function(url) {
    MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if(err) throw err;

        var collection = db.collection('lol_data');
        return collection.findOne({"url":url}, function(err, item) {
            if(err) throw err;
            console.log(item)

        });
    });

}

app.listen(1337);

console.log('server running at localhost:1337');

