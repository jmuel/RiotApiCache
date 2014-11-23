var app = require('express')();
var request = require('request');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var uriUtil = require('./uri-query-utils.js');
var collectionName = 'lol_data';

var key = '44b37d42-2e7e-4006-8f65-34b8ef8ca591';
var mongoUrl = 'mongodb://riotapi:riotapitest@dogen.mongohq.com:10085/app31717137';


var db;

app.get('/api/lol/*', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var url = uriUtil.buildUrl(req, key);
    checkCache(url, res);
});

app.get('/force/api/lol/*', function(req, res) {
    var url = uriUtil.buildUrl(req, key, true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    db.collection(collectionName).remove({url:url}, function(err) {
        if(err) throw err;
    });
    hitRiotAndStoreItInACache(url, res);
});

var checkCache = function (url, res) {
    db.collection(collectionName).findOne({"url": url}, function(err, item) {
        if (err) throw err;

        if (item) {
            res.send(item.data);
        }
        else {
            hitRiotAndStoreItInACache(url, res);
        }
    });
};

var hitRiotAndStoreItInACache = function (url, res) {
    var requestData;

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


app.listen(process.env.PORT || 1337);

console.log('server running');

