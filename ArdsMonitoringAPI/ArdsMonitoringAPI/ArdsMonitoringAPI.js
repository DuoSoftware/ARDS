var restify = require('restify');
var util = require('util');
var uuid = require('node-uuid');
var requsetMonitor = require('./RequestMonitor.js');
var resourceMonitor = require('./ResourceMonitor.js');
var infoLogger = require('../.././ArdsCommon/ArdsCommon/InformationLogger.js');


var server = restify.createServer({
    name: 'ArdsMonitoringAPI',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/request/getall/:company/:tenant', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('request-getall:company_%s:tenant_%s', data["company"], data["tenant"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- request/getall #', logkey, { request: req.params });
    requsetMonitor.GetAllRequests(logkey, data["company"], data["tenant"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/request/filterByClassTypeCategory/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('request-filterByClassTypeCategory:company_%s:tenant_%s:class_%s:type_%s:category_%s', data["company"], data["tenant"], data["class"], data["type"], data["category"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- request/getall #', logkey, { request: req.params });
    requsetMonitor.GetRequestFilterByClassTypeCategory(logkey, data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/queue/getall/:company/:tenant', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('request-getallQueueDetail:company_%s:tenant_%s', data["company"], data["tenant"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- request/getall #', logkey, { request: req.params });
    requsetMonitor.GetAllQueueDetails(logkey, data["company"], data["tenant"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/queue/filterByClassTypeCategory/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('queue-filterByClassTypeCategory:company_%s:tenant_%s:class_%s:type_%s:category_%s', data["company"], data["tenant"], data["class"], data["type"], data["category"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- request/getall #', logkey, { request: req.params });
    requsetMonitor.GetQueueDetailsFilterByClassTypeCategory(logkey, data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});


server.get('/resource/getall/:company/:tenant', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('resource-getall:company_%s:tenant_%s', data["company"], data["tenant"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- resource/getall #', logkey, { request: req.params });
    resourceMonitor.GetAllResources(logkey, data["company"], data["tenant"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/resource/filterByClassTypeCategory/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('resource-filterByClassTypeCategory:company_%s:tenant_%s:class_%s:type_%s:category_%s', data["company"], data["tenant"], data["class"], data["type"], data["category"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- resource/getall #', logkey, { request: req.params });
    resourceMonitor.GetResourceFilterByClassTypeCategory(logkey, data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/getall :: Error: %s #', logkey, err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/getall :: Result: %s #', logkey, 'success');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});


server.listen(2229, function () {
    console.log('%s listening at %s', server.name, server.url);
});