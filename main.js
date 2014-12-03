var app = require('express')(),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient,
    uriUtil = require('./uri-query-utils.js'),
    collectionName = 'lol_data',
    nconf = require('nconf');

nconf.env().argv();
nconf.file('env.json');

var key = nconf.get('RIOT_KEY');
var mongoUrl = nconf.get('MONGOHQ_URL');

console.log(key, mongoUrl)

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

    db.collection(collectionName).ensureIndex({createdAt: 1}, {expireAfterSeconds: 1200}, function(err) {
        if(err) throw err;
    });

});


app.listen(process.env.PORT || 1337);

console.log('server running');

