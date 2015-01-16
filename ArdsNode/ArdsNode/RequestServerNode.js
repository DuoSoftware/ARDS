var restify = require('restify');
var redisHandler = require('./RedisHandler.js');
var util = require('util');
var resourceHandler = require('./ResourceHandler.js');
var requestHandler = require('./RequestHandler.js');
var reqServerHandler = require('./ReqServerHandler.js');
var reqMetaHandler = require('./ReqMetaDataHandler.js');

var server = restify.createServer({
    name: 'ArdsServer',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.post('/requestserver/add', function (req, res, next) {    
    reqServerHandler.AddRequestServer(req.body, function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/requestserver/set', function (req, res, next) {
    reqServerHandler.SetRequestServer(req.body, function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.post('/requestserver/searchbytag', function (req, res, next) {
    var tags = req.body.Tags;
    reqServerHandler.SearchReqServerByTags(tags, function (err, result) {
        if (err != null) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/requestserver/get/:company/:tenant/:serverid', function (req, res, next) {
    var data = req.params;
    reqServerHandler.GetRequestServer(data["company"], data["tenant"], data["serverid"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.del('/requestserver/remove/:company/:tenant/:serverid', function (req, res, next) {
    var data = req.params;
    
    reqServerHandler.RemoveRequestServer(data["company"], data["tenant"], data["serverid"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.post('/requestmeta/add', function (req, res, next) {
    reqMetaHandler.AddMeataData(req.body, function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/requestmeta/set', function (req, res, next) {
    reqMetaHandler.SetMeataData(req.body, function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.post('/requestmeta/searchbytag', function (req, res, next) {
    var tags = req.body.Tags;
    reqMetaHandler.SearchMeataDataByTags(tags, function (err, result) {
        if (err != null) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/requestmeta/get/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    reqMetaHandler.GetMeataData(data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.del('/requestmeta/remove/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    reqMetaHandler.RemoveMeataData(data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.post('/resource/add', function (req, res, next) {
    resourceHandler.AddResource(req.body, function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/resource/set', function (req, res, next) {
    resourceHandler.SetResource(req.body.ResourceData, req.body.CVid, function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/resource/searchbytag', function (req, res, next) {
    var tags = req.body.Tags;
    resourceHandler.SearchResourceByTags(tags, function (err, result) {
        if (err != null) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/resource/get/:company/:tenant/:resourceid', function (req, res, next) {
    var data = req.params;    
    resourceHandler.GetResource(data["company"], data["tenant"], data["resourceid"], function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            var resData = { obj: result, vid: vid };
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(resData);
        }
    });
    return next();
});

server.del('/resource/remove/:company/:tenant/:resourceid', function (req, res, next) {
    var data = req.params;
    
    resourceHandler.RemoveResource(data["company"], data["tenant"], data["resourceid"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.post('/request/add', function (req, res, next) {
    requestHandler.AddRequest(req.body, function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/request/set', function (req, res, next) {
    requestHandler.SetRequest(req.body.RequestData, req.body.CVid, function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/request/searchbytag', function (req, res, next) {
    var tags = req.body.Tags;
    requestHandler.SearchRequestByTags(tags, function (err, result) {
        if (err != null) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/request/get/:company/:tenant/:sessionid', function (req, res, next) {
    var data = req.params;
    requestHandler.GetRequest(data["company"], data["tenant"], data["sessionid"], function (err, result, vid) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            var resData = { obj: result, vid: vid };
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(resData);
        }
    });
    return next();
});

server.del('/request/remove/:company/:tenant/:sessionid', function (req, res, next) {
    var data = req.params;
    
    requestHandler.RemoveRequest(data["company"], data["tenant"], data["sessionid"], function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.listen(2225, function () {
    console.log('%s listening at %s', server.name, server.url);
});