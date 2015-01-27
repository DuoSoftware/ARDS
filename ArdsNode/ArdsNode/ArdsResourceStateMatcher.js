var restify = require('restify');
var redisHandler = require('./RedisHandler.js');
var util = require('util');

var server = restify.createServer({
    name: 'ArdsResourceStateMatcher',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/resourcestate/push', function (req, res, next) {
    processState(req.body, function (err, result) {
        if (err != null) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            var StateKey = util.format('ResourceState:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ResourceId);
            redisHandler.SetObj(StateKey, result, function (err, result) {
                if (err != null) {
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(err);
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end();
                }
            });
        }
    });
    return next();
});

var processState = function (data, callback) {
    callback(null, data.State);
};


server.listen(2227, function () {
    console.log('%s listening at %s', server.name, server.url);
});