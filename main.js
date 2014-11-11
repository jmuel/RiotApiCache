var app = require('express')();
var request = require('request');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var uriUtil = require('./uri-query-utils.js');
var collectionName = 'lol_data';

var key = '44b37d42-2e7e-4006-8f65-34b8ef8ca591';
var mongoUrl = 'mongodb://127.0.0.1:27017/test';
var riotBaseUrl = 'https://na.api.pvp.net';

var db;

app.get('/api/lol/*', function (req, res) {
    var url = buildUrl(req);
    checkCache(url, res);
});

app.get('/force/api/lol/*', function(req, res) {
    var url = buildUrl(req, true);
    console.log(url);
    console.log(req.path);
    db.collection(collectionName).remove({url:url}, function(err) {
        if(err) throw err;
    });
    hitRiotAndStoreItInACache(url, res);
});

var buildUrl = function(req, force) {
    var path = req.path;
    if(force) path = path.slice(6);
    return riotBaseUrl + path + uriUtil.addQuery(_.extend({api_key: key}, req.query));
}

var checkCache = function (url, res) {
    db.collection(collectionName).findOne({"url": url}, function(err, item) {
        if (err) throw err;

        if (item) {
            console.log(item);
            res.send(item.data);
        }
        else {
            hitRiotAndStoreItInACache(url, res);
        }
    });
};

var hitRiotAndStoreItInACache = function (url, res) {
    var requestData;
    console.log('hitting riot directly');

    var body = '';
    requestData = request(url);

    requestData.on('data', function(chunk) {
        body += chunk;
    });

    requestData.on('end', function() {
        var data;
        try {
            data = JSON.parse(body);
        } catch(err) {
            res.statusCode = 400;
            return res.end('error' + err.message);
        }

        res.send(data);
        var document = {
            createdAt: new Date(),
            url: url,
            data: data
        };

        db.collection(collectionName).insert(document, function(err) {
            if(err) throw err;
        });
    });
};




MongoClient.connect(mongoUrl, function (err, databaseConnection) {
    if (err) throw err;

    db = databaseConnection;

    db.collection(collectionName).ensureIndex({createdAt: 1}, {expireAfterSeconds: 60}, function(err) {
        if(err) throw err;
    });

});


app.listen(1337);

console.log('server running at localhost:1337');

