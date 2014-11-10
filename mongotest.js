var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');

    collection.insert({a:2}, function(err, docs) {

        collection.find().toArray(function(err, results) {
            console.dir(results);

            db.close();
        });
    });

});