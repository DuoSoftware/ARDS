var assert = require('assert');
var restify = require('restify');

var client = function (url) {
    return restify.createJsonClient({
        url: url,
        version: '~1.0'
    });
};

var DoGet = function (url, params, callback) {
    client(url).get(params, function (err, req, res, obj) {
        assert.ifError(err);
        console.log('Server returned: %j', obj);
        callback(err, res, obj);
    });
};

var DoPost = function (url, method, postData, callback) {
    client(url).post(method, postData, function (err, req, res, obj) {
        assert.ifError(err);
        console.log('Server returned: %j', obj);
        callback(err, res, obj);
    });
};

var DoGetSync = function (url, params) {
    client(url).get(params, function (err, req, res, obj) {
        assert.ifError(err);
        console.log('Server returned: %j', obj);
        return obj;
    });
};

var DoPostSync = function (url, postData) {
    client(url).post(postData, function (err, req, res, obj) {
        assert.ifError(err);
        console.log('Server returned: %j', obj);
        return obj;
    });
};

module.exports.DoGet = DoGet;
module.exports.DoPost = DoPost;
module.exports.DoGetSync = DoGetSync;
module.exports.DoPostSync = DoPostSync; 