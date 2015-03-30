var restify = require('restify');
var redisHandler = require('./RedisHandler.js');
var reqServerHandler = require('./ReqServerHandler.js');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sort = require('./SortArray.js');

var server = restify.createServer({
    name: 'ArdsPreProcessor',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/preprocessor/execute', function (req, res, next) {
    execute(req.body, function (err, result) {
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

var execute = function (data, callback) {
    var srs = SetRequestServer(data);
    var key = util.format('ReqMETA:%d:%d:%s:%s:%s', data.Company, data.Tenant, data.Class, data.Type, data.Category);
    var date = new Date();
    
    srs.on('server', function (url) {
        redisHandler.GetObj(key, function (err, result) {
            if (err) {
                callback(err, null);
            }
            else if (result == null) {
                callback(null, null);
            }
            else {
                var metaObj = JSON.parse(result);
                
                var attributeInfo = [];
                var sortedAttributes = sort.sortData(data.Attributes);
                for (var i in sortedAttributes) {
                    var val = sortedAttributes[i];

                    attributeInfo = AppendAttributeInfo(attributeInfo, metaObj.AttributeMeta, val);
                    //for (var j in metaObj.AttributeMeta) {
                    //    var val1 = metaObj.AttributeMeta[j].AttributeCode;
                    //    if (val1.indexOf(val) == 1) {
                    //        attributeInfo.push(metaObj.AttributeMeta[j]);
                    //    }
                    //}
                }
                
                var attributeDataString = util.format('attribute_%s', sortedAttributes.join(":attribute_"));
                var queueId = util.format('Queue:%d:%d:%s:%s:%s:%s:%s', data.Company, data.Tenant, data.Class, data.Type, data.Category, attributeDataString, data.Priority.toUpperCase());
                var date = new Date();
                var requestObj = { Company: data.Company, Tenant: data.Tenant, Class: data.Class, Type: data.Type, Category: data.Category, SessionId: data.SessionId, AttributeInfo: attributeInfo, RequestServerId: data.RequestServerId, Priority: data.Priority.toUpperCase(), ArriveTime: date.toISOString(), OtherInfo: data.OtherInfo, ServingAlgo: metaObj.ServingAlgo, HandlingAlgo: metaObj.HandlingAlgo, SelectionAlgo: metaObj.SelectionAlgo, RequestServerUrl: url, QueueId: queueId, ReqHandlingAlgo: metaObj.ReqHandlingAlgo, ReqSelectionAlgo: metaObj.ReqSelectionAlgo};
                callback(null, requestObj);
            }
        });
    
    });
};

var AppendAttributeInfo = function (attInfo, attMetaData, att) {
    for (var i in attInfo) {
        var info = attInfo[i];
        for (var j in attMetaData) {
            var attMeta = attMetaData[j];
            if (attMeta.AttributeCode.indexOf(att) >= 0) {
                if (info.AttributeClass == attMeta.AttributeClass && info.AttributeType == attMeta.AttributeType && info.AttributeCategory == attMeta.AttributeCategory) {
                    info.AttributeCode.push(att);
                    return attInfo;
                }
                else {
                    var tempObj = { AttributeClass: attMeta.AttributeClass, AttributeType: attMeta.AttributeType, AttributeCategory: attMeta.AttributeCategory, AttributeCode: [att], WeightPrecentage: attMeta.WeightPrecentage };
                    attInfo.push(tempObj);
                    return attInfo;
                }
            }
            else {
                return attInfo;
            }
        }
    }

    for (var j in attMetaData) {
        var attMeta = attMetaData[j];
        if (attMeta.AttributeCode.indexOf(att) >= 0) {
            var tempObj = { AttributeClass: attMeta.AttributeClass, AttributeType: attMeta.AttributeType, AttributeCategory: attMeta.AttributeCategory, AttributeCode: [att], WeightPrecentage: attMeta.WeightPrecentage };
            attInfo.push(tempObj);
            return attInfo;
        }
        else {
            return attInfo;
        }
    }


};

var SetRequestServer = function (data) {
    var e = new EventEmitter();
    process.nextTick(function () {
        if (data.RequestServerId == "0") {
            var tags = ["company_"+data.Company, "tenant_" + data.Tenant, "class_" + data.Class, "type_" + data.Type, "category_" + data.Category];
            reqServerHandler.SearchReqServerByTags(tags, function (err, result) {
                if (err) {
                    e.emit('server', "");
                }
                else {
                    var randServer = result[Math.floor(Math.random() * result.length)];
                    e.emit('server', randServer.CallbackUrl);
                }
            });
        }
        else {
            reqServerHandler.GetRequestServer(data.Company, data.Tenant, data.RequestServerId, function (err, reqServerResult) {
                if (err) {
                    e.emit('server', "");
                }
                else {
                    e.emit('server', reqServerResult.CallbackUrl);
                }
            });
        }
    });
    
    return (e);
};


server.listen(2226, function () {
    console.log('%s listening at %s', server.name, server.url);
});