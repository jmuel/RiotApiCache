var _ = require('underscore');

var util = {};

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

module.exports = util;