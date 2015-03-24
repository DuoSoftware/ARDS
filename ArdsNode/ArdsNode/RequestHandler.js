var util = require('util');
var redisHandler = require('./RedisHandler.js');
var sortArray = require('./SortArray.js');

var AddRequest = function (requestObj, callback) {
    var key = util.format('Request:%d:%d:%s', requestObj.Company, requestObj.Tenant, requestObj.SessionId);
    var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_Request", "sessionid_" + requestObj.SessionId, "reqserverid_"+ requestObj.RequestServerId, "priority_"+ requestObj.Priority, "servingalgo_"+ requestObj.ServingAlgo, "handlingalgo" + requestObj.HandlingAlgo, "selectionalgo" + requestObj.SelectionAlgo];
    
    var tempAttributeList = [];
    for (var i in requestObj.AttributeInfo) {
        var atts = requestObj.AttributeInfo[i].AttributeCode;
        for (var j in atts) {
            tempAttributeList.push(atts[j]);
        }
    }
    var sortedAttributes = sortArray.sortData(tempAttributeList);
    for (var k in sortedAttributes) {
        tag.push("attribute_" + sortedAttributes[k]);
    }

    var jsonObj = JSON.stringify(requestObj);
    
    redisHandler.AddObj_V_T(key, jsonObj, tag, function (err, reply, vid) {
        callback(err, reply, vid);
    });
};

var SetRequest = function (requestObj, cVid, callback) {
    var key = util.format('Request:%d:%d:%s', requestObj.Company, requestObj.Tenant, requestObj.SessionId);
    var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_Request", "sessionid_" + requestObj.SessionId, "reqserverid_" + requestObj.RequestServerId, "priority_" + requestObj.Priority, "servingalgo_" + requestObj.ServingAlgo, "handlingalgo" + requestObj.HandlingAlgo, "selectionalgo" + requestObj.SelectionAlgo];
    var tempAttributeList = [];
    for (var i in requestObj.AttributeInfo) {
        var atts = requestObj.AttributeInfo[i].AttributeCode;
        for (var j in atts) {
            tempAttributeList.push(atts[j]);
        }
    }
    var sortedAttributes = sortArray.sortData(tempAttributeList);
    for (var k in sortedAttributes) {
        tag.push("attribute_" + sortedAttributes[k]);
    }
    var jsonObj = JSON.stringify(requestObj);
    
    redisHandler.SetObj_V_T(key, jsonObj, tag, cVid, function (err, reply, vid) {
        callback(err, reply, vid);
    });
};

var RemoveRequest = function (company, tenant, sessionId, callback) {
    var key = util.format('Request:%s:%s:%s', company, tenant, sessionId);
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var requestObj = JSON.parse(obj);
            var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_Request", "sessionid_" + requestObj.SessionId, "reqserverid_" + requestObj.RequestServerId, "priority_" + requestObj.Priority, "servingalgo_" + requestObj.ServingAlgo, "handlingalgo" + requestObj.HandlingAlgo, "selectionalgo" + requestObj.SelectionAlgo];
            var tempAttributeList = [];
            for (var i in requestObj.AttributeInfo) {
                var atts = requestObj.AttributeInfo[i].AttributeCode;
                for (var j in atts) {
                    tempAttributeList.push(atts[j]);
                }
            }
            var sortedAttributes = sortArray.sortData(tempAttributeList);
            for (var k in sortedAttributes) {
                tag.push("attribute_" + sortedAttributes[k]);
            }
            
            redisHandler.RemoveObj_V_T(key, tag, function (err, result) {
                if (err) {
                    callback(err, "false");
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
};

var GetRequest = function (company, tenant, sessionId, callback) {
    var key = util.format('Request:%s:%s:%s', company, tenant, sessionId);
    redisHandler.GetObj_V(key, function (err, obj, vid) {
        callback(err, obj, vid);
    });
};

var SearchRequestByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_Request");
        redisHandler.SearchObj_V_T(tags, function (err, result) {
            callback(err, result);
        });
    }
    else {
        var e = new Error();
        e.message = "tags must be a string array";
        callback(e, null);
    }
};

var AddProcessingRequest = function (requestObj, callback) {
    var key = util.format('ProcessingRequest:%d:%d:%s', requestObj.Company, requestObj.Tenant, requestObj.SessionId);
    var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_ProcessingRequest", "sessionid_" + requestObj.SessionId, "reqserverid_" + requestObj.RequestServerId, "priority_" + requestObj.Priority, "servingalgo_" + requestObj.ServingAlgo, "handlingalgo" + requestObj.HandlingAlgo, "selectionalgo" + requestObj.SelectionAlgo];
    for (var i in requestObj.AttributeInfo) {
        tag.push("attribute_" + requestObj.AttributeInfo[i].AttributeCode);
    }
    var jsonObj = JSON.stringify(requestObj);
    
    redisHandler.AddObj_T(key, jsonObj, tag, function (err, reply) {
        callback(err, reply);
    });
};

var GetProcessingRequest = function (company, tenant, sessionId, callback) {
    var key = util.format('ProcessingRequest:%s:%s:%s', company, tenant, sessionId);
    redisHandler.GetObj(key, function (err, obj) {
        callback(err, obj);
    });
};

var RemoveProcessingRequest = function (company, tenant, sessionId, callback) {
    var key = util.format('ProcessingRequest:%s:%s:%s', company, tenant, sessionId);
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var requestObj = JSON.parse(obj);
            var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_Request", "sessionid_" + requestObj.SessionId, "reqserverid_" + requestObj.RequestServerId, "priority_" + requestObj.Priority, "servingalgo_" + requestObj.ServingAlgo, "handlingalgo" + requestObj.HandlingAlgo, "selectionalgo" + requestObj.SelectionAlgo];
            for (var i in requestObj.AttributeInfo) {
                tag.push("attribute_" + requestObj.AttributeInfo[i].AttributeCode);
            }
            
            redisHandler.RemoveObj_T(key, tag, function (err, result) {
                if (err) {
                    callback(err, "false");
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
};

var SearchProcessingRequestByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_ProcessingRequest");
        redisHandler.SearchObj_T(tags, function (err, result) {
            callback(err, result);
        });
    }
    else {
        var e = new Error();
        e.message = "tags must be a string array";
        callback(e, null);
    }
};

module.exports.AddRequest = AddRequest;
module.exports.SetRequest = SetRequest;
module.exports.RemoveRequest = RemoveRequest;
module.exports.GetRequest = GetRequest;
module.exports.SearchRequestByTags = SearchRequestByTags;
module.exports.AddProcessingRequest = AddProcessingRequest;
module.exports.GetProcessingRequest = GetProcessingRequest;
module.exports.RemoveProcessingRequest = RemoveProcessingRequest;
module.exports.SearchProcessingRequestByTags = SearchProcessingRequestByTags;
