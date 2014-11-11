var _ = require('underscore');

var util = {};
var riotBaseUrl = 'https://na.api.pvp.net';

util.addQuery = function(params) {
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

util.buildUrl = function(req, key, force) {
    var path = req.path;
    if(force) path = path.slice(6);
    return riotBaseUrl + path + this.addQuery(_.extend({api_key: key}, req.query));
};



module.exports = util;