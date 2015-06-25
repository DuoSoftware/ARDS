var restify = require('restify');
var redisHandler = require('../../.././ArdsCommon/ArdsCommon/redisHandler.js');
var util = require('util');
var resourceHandler = require('../../.././ArdsCommon/ArdsCommon/ResourceHandler.js');
var requestHandler = require('../../.././ArdsCommon/ArdsCommon/RequestHandler.js');
var reqServerHandler = require('../../.././ArdsCommon/ArdsCommon/ReqServerHandler.js');
var reqMetaHandler = require('../../.././ArdsCommon/ArdsCommon/ReqMetaDataHandler.js');
var reqQueueHandler = require('../../.././ArdsCommon/ArdsCommon/ReqQueueHandler.js');
var continueArdsHandler = require('./ContinueArdsProcess.js');
var infoLogger = require('../../.././ArdsCommon/ArdsCommon/InformationLogger.js');
var resStateMapper = require('../../.././ArdsCommon/ArdsCommon/ResourceStateMapper.js');
var uuid = require('node-uuid');
var startArds = require('./StartArds.js');

var server = restify.createServer({
    name: 'ArdsServer',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.post('/requestserver/add', function (req, res, next) {
    var objkey = util.format('ReqServer:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ServerID);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);   
    infoLogger.ReqResLogger.log('info', '%s Start- requestserver/add #', logkey, { request: req.body });
    reqServerHandler.AddRequestServer(logkey, req.body, function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/add :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- requestserver/add :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/add :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/add :: Result: %s #', logkey, 'false', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/requestserver/set', function (req, res, next) {
    var objkey = util.format('ReqServer:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ServerID);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestserver/set #', logkey, { request: req.body });
    reqServerHandler.SetRequestServer(logkey, req.body, function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/set :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- requestserver/set :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/set :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/set :: Result: %s #', logkey, 'false', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.post('/requestserver/searchbytag', function (req, res, next) {
    var logkey = util.format('[%s]::requestserver-searchbytag', uuid.v1());

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestserver/searchbytag #', logkey, { request: req.body });
    var tags = req.body.Tags;
    reqServerHandler.SearchReqServerByTags(logkey, tags, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- requestserver/searchbytag :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/searchbytag :: Result: %j #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/requestserver/get/:company/:tenant/:serverid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('ReqServer:%s:%s:%s', data["company"], data["tenant"], data["serverid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestserver/get #', logkey, { request: req.params });
    reqServerHandler.GetRequestServer(logkey, data["company"], data["tenant"], data["serverid"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- requestserver/get :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/get :: Result: %s #', logkey, result, { request: req.params });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.del('/requestserver/remove/:company/:tenant/:serverid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('ReqServer:%s:%s:%s', data["company"], data["tenant"], data["serverid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestserver/remove #', logkey, { request: req.params });
    
    reqServerHandler.RemoveRequestServer(logkey, data["company"], data["tenant"], data["serverid"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- requestserver/remove :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestserver/remove :: Result: %s #', logkey, result, { request: req.params });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.post('/requestmeta/add', function (req, res, next) {
    var objkey = util.format('ReqMETA:%d:%d:%s:%s:%s', req.body.Company, req.body.Tenant, req.body.Class, req.body.Type, req.body.Category);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestmeta/add #', logkey, { request: req.body });
    reqMetaHandler.AddMeataData(logkey, req.body, function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/add :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- requestmeta/add :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/add :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/add :: Result: %s #', logkey, 'false', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/requestmeta/set', function (req, res, next) {
    var objkey = util.format('ReqMETA:%d:%d:%s:%s:%s', req.body.Company, req.body.Tenant, req.body.Class, req.body.Type, req.body.Category);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestmeta/set #', logkey, { request: req.body });
    reqMetaHandler.SetMeataData(logkey, req.body, function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/set :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- requestmeta/set :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/set :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/set :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.post('/requestmeta/searchbytag', function (req, res, next) {
    var logkey = util.format('[%s::requestmeta-searchbytag]', uuid.v1());

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestmeta/searchbytag #', logkey, { request: req.body });
    var tags = req.body.Tags;
    reqMetaHandler.SearchMeataDataByTags(logkey, tags, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- requestmeta/searchbytag :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/searchbytag :: Result: %j #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/requestmeta/get/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('ReqMETA:%s:%s:%s:%s:%s', data["company"], data["tenant"], data["class"], data["type"], data["category"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestmeta/get #', logkey, { request: req.params });
    reqMetaHandler.GetMeataData(logkey, data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- requestmeta/get :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/get :: Result: %s #', logkey, result, { request: req.params });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.del('/requestmeta/remove/:company/:tenant/:class/:type/:category', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('ReqMETA:%s:%s:%s:%s:%s', data["company"], data["tenant"], data["class"], data["type"], data["category"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- requestmeta/remove #', logkey, { request: req.params });
    reqMetaHandler.RemoveMeataData(logkey, data["company"], data["tenant"], data["class"], data["type"], data["category"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- requestmeta/remove :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- requestmeta/remove :: Result: %s #', logkey, result, { request: req.params });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});


server.post('/resource/add', function (req, res, next) {
    var objkey = util.format('Resource:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ResourceId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/add #', logkey, { request: req.body });
    resourceHandler.AddResource(logkey, req.body, function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- resource/add :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- resource/add :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- resource/add :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/add :: Result: %s #', logkey, 'false', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/resource/set', function (req, res, next) {
    var objkey = util.format('Resource:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ResourceId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/set #', logkey, { request: req.body });
    resourceHandler.SetResource(logkey, req.body.ResourceData, req.body.CVid, function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- resource/set :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- resource/set :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- resource/set :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/set :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/resource/searchbytag', function (req, res, next) {
    var logkey = util.format('[%s::resource-searchbytag]', uuid.v1());

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/searchbytag #', logkey, { request: req.body });
    var tags = req.body.Tags;
    resourceHandler.SearchResourcebyTags(logkey, tags, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/searchbytag :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/searchbytag :: Result: %j #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/resource/get/:company/:tenant/:resourceid', function (req, res, next) {
    var data = req.params;    
    var objkey = util.format('Resource:%s:%s:%s', data["company"], data["tenant"], data["resourceid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/get #', logkey, { request: req.params });
    resourceHandler.GetResource(logkey, data["company"], data["tenant"], data["resourceid"], function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/get :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/get :: Result: %s :: Vid: %d #', logkey, result, vid, { request: req.params });
            var resData = { obj: JSON.parse(result), vid: vid };
            var stringResData = JSON.stringify(resData);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(stringResData);
        }
    });
    return next();
});

server.del('/resource/remove/:company/:tenant/:resourceid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('Resource:%s:%s:%s', data["company"], data["tenant"], data["resourceid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/remove #', logkey, { request: req.params });
    
    resourceHandler.RemoveResource(logkey, data["company"], data["tenant"], data["resourceid"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/remove :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/remove :: Result: %s #', logkey, result, { request: req.params });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.post('/resource/cs/update', function (req, res, next) {
    var objkey = util.format('Resource:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ResourceId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- resource/cs/update #', logkey, { request: req.body });
    switch (req.body.State) {
        case "Available":
            resourceHandler.UpdateSlotStateAvailable(logkey, req.body.Company, req.body.Tenant, req.body.Class, req.body.Type, req.body.Category, req.body.ResourceId, req.body.SlotId, req.body.OtherInfo, function (err, result) {
                if (err != null) {
                    infoLogger.ReqResLogger.log('error', '%s End- resource/cs/update :: Error: %s #', logkey, err, { request: req.body });
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(err);
                }
                else {
                    infoLogger.ReqResLogger.log('info', '%s End- resource/cs/update :: Result: %j #', logkey, result, { request: req.body });
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(result);
                }
            });
            break;

        case "Reserved":
            resourceHandler.UpdateSlotStateReserved(logkey, req.body.Company, req.body.Tenant, req.body.Class, req.body.Type, req.body.Category, req.body.ResourceId, req.body.SlotId, req.body.SessionId, req.body.OtherInfo, function (err, result) {
                if (err != null) {
                    infoLogger.ReqResLogger.log('error', '%s End- resource/cs/update :: Error: %s #', logkey, err, { request: req.body });
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(err);
                }
                else {
                    infoLogger.ReqResLogger.log('info', '%s End- resource/cs/update :: Result: %j #', logkey, result, { request: req.body });
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(result);
                }
            });
            break;
        
        case "Connected":
            resourceHandler.UpdateSlotStateConnected(logkey, req.body.Company, req.body.Tenant, req.body.Class, req.body.Type, req.body.Category, req.body.ResourceId, req.body.SlotId, req.body.SessionId, req.body.OtherInfo, function (err, result) {
                if (err != null) {
                    infoLogger.ReqResLogger.log('error', 'End- resource/cs/update :: Error: %s #', err, { request: req.body });
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(err);
                }
                else {
                    infoLogger.ReqResLogger.log('info', 'End- resource/cs/update :: Result: %j #', result, { request: req.body });
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(result);
                }
            });
            break;
    }
    
    return next();
});

server.post('/resource/cs/updatebysessionid', function (req, res, next) {
    var objkey = util.format('%d:%d:Session::%s:res::%s', req.body.Company, req.body.Tenant, req.body.SessionId, req.body.ResourceId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);
    
    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- resource/cs/updatebysessionid #', logkey, { request: req.body });
    
    resourceHandler.UpdateSlotStateBySessionId(logkey, req.body.Company, req.body.Tenant, req.body.ReqClass, req.body.ReqType, req.body.ReqCategory, req.body.ResourceId, req.body.SessionId, req.body.State, req.body.OtherInfo, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', 'End- resource/cs/updatebysessionid :: Error: %s #', err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', 'End- resource/cs/updatebysessionid :: Result: %j #', result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    
    return next();
});

server.post('/resource/state/push', function (req, res, next) {
    var objkey = util.format('Resource:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.ResourceId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey);
    infoLogger.ReqResLogger.log('info', '%s Start- resource/state/push #', logkey, { request: req.body });
    var tags = req.body.Tags;
    resStateMapper.SetResourceState(logkey, req.body.Company, req.body.Tenant, req.body.ResourceId, req.body.State, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- resource/state/push :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- resource/state/push :: Result: %j #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});


server.post('/request/add', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/add #', logkey, { request: req.body });
    startArds.AddRequest(logkey, req.body, function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- request/add :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- request/add :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result == null) {
            infoLogger.ReqResLogger.log('info', '%s End- request/add :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/add :: Result: %s #', logkey, 'false', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var jsonResult = JSON.stringify(result);
            res.end(jsonResult);
        }
    });
    return next();
});

server.post('/request/set', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/set #', logkey, { request: req.body });
    requestHandler.SetRequest(logkey, req.body.RequestData, req.body.CVid, function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('info', '%s End- request/set :: Result: %s #', logkey, 'false', { request: req.body });
            infoLogger.ReqResLogger.log('error', '%s End- request/set :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else if (result === "OK") {
            infoLogger.ReqResLogger.log('info', '%s End- request/set :: Result: %s #', logkey, 'true', { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("true");
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/set :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end("False");
        }
    });
    return next();
});

server.post('/request/searchbytag', function (req, res, next) {
    var logkey = util.format('[%s::request-searchbytag]', uuid.v1());

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/searchbytag #', logkey, { request: req.body });
    var tags = req.body.Tags;
    requestHandler.SearchRequestByTags(logkey, tags, function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- request/searchbytag :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/searchbytag :: Result: %j #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var resDatat = JSON.stringify(result);
            res.end(resDatat);
        }
    });
    return next();
});

server.get('/request/get/:company/:tenant/:sessionid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('Request:%s:%s:%s', data["company"], data["tenant"], data["sessionid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/get #', logkey, { request: req.params });
    requestHandler.GetRequest(logkey, data["company"], data["tenant"], data["sessionid"], function (err, result, vid) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/get :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/get :: Result: %s :: Vid: %d #', logkey, result, vid, { request: req.params });
            var resData = { obj: JSON.parse(result), vid: vid };
            var stringReqData = JSON.stringify(resData);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(stringReqData);
        }
    });
    return next();
});

server.del('/request/remove/:company/:tenant/:sessionid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('Request:%s:%s:%s', data["company"], data["tenant"], data["sessionid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/remove #', logkey, { request: req.params });
    console.log("remove method hit :: SessionID: " + data["sessionid"]);
    requestHandler.RemoveRequest(logkey, data["company"], data["tenant"], data["sessionid"], function (err, result) {
        if (err) {
            infoLogger.ReqResLogger.log('error', '%s End- request/remove :: Error: %s #', logkey, err, { request: req.params });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/remove :: Result: %s #', logkey, result, { request: req.params });
            console.log(result);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    return next();
});

server.del('/request/reject/:company/:tenant/:sessionid/:reason', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('Request:%s:%s:%s', data["company"], data["tenant"], data["sessionid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/reject #', logkey, { request: req.params });
    console.log("reject method hit :: SessionID: "+ data["sessionid"]+" :: Reason: "+ data["reason"]);
    if (data["reason"] == "NoSession" || data["reason"] == "ClientRejected") {
        requestHandler.RemoveRequest(logkey, data["company"], data["tenant"], data["sessionid"], function (err, result) {
            if (err) {
                infoLogger.ReqResLogger.log('error', '%s End- request/reject :: Error: %s #', logkey, err, { request: req.params });
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(err);
            }
            else {
                infoLogger.ReqResLogger.log('info', '%s End- request/reject :: Result: %s #', logkey, result, { request: req.params });
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(result);
            }
        });
    }
    else {
        requestHandler.RejectRequest(logkey, data["company"], data["tenant"], data["sessionid"], data["reason"], function (err, result) {
            if (err != null) {
                infoLogger.ReqResLogger.log('error', '%s End- request/reject :: Error: %s #', logkey, err, { request: req.params });
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(err);
            }
            else {
                infoLogger.ReqResLogger.log('info', '%s End- request/reject :: Result: %s #', logkey, result, { request: req.params });
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var resDatat = JSON.stringify(result);
                res.end(resDatat);
            }
        });
    }
    return next();
});

server.post('/request/state/update/na', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/state/update/na #', logkey, { request: req.body });
    requestHandler.SetRequestState(logkey, req.body.Company, req.body.Tenant, req.body.SessionId, "N/A", function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- request/state/update/na :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/state/update/na :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    
    return next();
});

server.post('/request/state/update/queued', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/state/update/queued #', logkey, { request: req.body });
    requestHandler.SetRequestState(logkey, req.body.Company, req.body.Tenant, req.body.SessionId, "QUEUED", function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- request/state/update/queued :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/state/update/queued :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    
    return next();
});

server.post('/request/state/update/trying', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    infoLogger.ReqResLogger.log('info', '%s --------------------------------------------------', logkey); 
    infoLogger.ReqResLogger.log('info', '%s Start- request/state/update/trying #', logkey, { request: req.body });
    requestHandler.SetRequestState(logkey, req.body.Company, req.body.Tenant, req.body.SessionId, "TRYING", function (err, result) {
        if (err != null) {
            infoLogger.ReqResLogger.log('error', '%s End- request/state/update/trying :: Error: %s #', logkey, err, { request: req.body });
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(err);
        }
        else {
            infoLogger.ReqResLogger.log('info', '%s End- request/state/update/trying :: Result: %s #', logkey, result, { request: req.body });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(result);
        }
    });
    
    return next();
});



server.post('/queue/add', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    reqQueueHandler.AddRequestToQueue(logkey, req.body, function (err, result) {
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

server.post('/queue/readd', function (req, res, next) {
    var objkey = util.format('Request:%d:%d:%s', req.body.Company, req.body.Tenant, req.body.SessionId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    reqQueueHandler.ReAddRequestToQueue(logkey, req.body, function (err, result) {
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

server.post('/queue/setnextprocessingitem', function (req, res, next) {
    var objkey = util.format('QueueId:%s', req.body.queueId);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    reqQueueHandler.SetNextProcessingItem(logkey, req.body.queueId, req.body.processingHashId);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end("true");
    return next();
});

server.del('/queue/remove/:company/:tenant/:sessionid', function (req, res, next) {
    var data = req.params;
    var objkey = util.format('Request:%s:%s:%s', data["company"], data["tenant"], data["sessionid"]);
    var logkey = util.format('[%s]::[%s]', uuid.v1(), objkey);

    reqQueueHandler.RemoveRequestFromQueue(logkey, data["queueId"], data["sessionid"], function (err, result) {
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


server.post('/ards/continueprocess', function (req, res, next) {
    continueArdsHandler.ContinueArds(req.body, function (result) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        var resultS = JSON.stringify(result);
        res.end(resultS);
    });
    return next();
});

server.listen(2225, function () {
    console.log('%s listening at %s', server.name, server.url);
});