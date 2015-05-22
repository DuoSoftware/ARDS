var restify = require('restify');
var util = require('util');
var uuid = require('node-uuid');

var server = restify.createServer({
    name: 'ArdsMonitoringAPI',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.listen(2225, function () {
    console.log('%s listening at %s', server.name, server.url);
});