var app = require('express')();
var request = require('request');
var _ = require('underscore');

var key = "44b37d42-2e7e-4006-8f65-34b8ef8ca591";

app.get("/api/lol/*", function(req, res) {
    var url = "https://na.api.pvp.net";
    url += req.path + addQuery(_.extend({api_key: key}, req.query));
    console.log(url);
    req.pipe(request(url)).pipe(res);
});

var addQuery = function(params) {
    var queryString = _.reduce(params, function(components, value, key) {
            components.push(key + '=' + encodeURIComponent(value));
            return components;
        },
        []
    ).join('&');

    if(queryString.length > 0){
        queryString = '?' + queryString;
    }
    return queryString;

}

app.listen(1337);

console.log('server running at localhost:1337');

