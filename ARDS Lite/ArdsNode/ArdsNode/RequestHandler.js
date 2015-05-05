var util = require('util');
var redisHandler = require('./RedisHandler.js');
var sortArray = require('./SortArray.js');
var reqQueueHandler = require('./ReqQueueHandler.js');
var resourceHandler = require('./ResourceHandler.js');
var preProcessHandler = require('./PreProcessor.js');
var contArdsHandler = require('./ContinueArdsProcess.js');

var AddRequest = function (reqPreObj, callback) {
    preProcessHandler.execute(reqPreObj, function (err, requestObj) {
        if (err) {
            console.log(err);
        }
        else {
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
            redisHandler.AddObj_V_T(key, jsonObj, tag, function (err, reply, vid) {
                if (err) {
                    console.log(err);
                    callback(err, null, 0);
                }
                else {
                    SetRequestState(requestObj.Company, requestObj.Tenant, requestObj.SessionId, "N/A", function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    switch (requestObj.ReqHandlingAlgo) {
                        case "QUEUE":
                            reqQueueHandler.AddRequestToQueue(requestObj, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    callback(err, "Add Request to Queue Failed. sessionId :: " + requestObj.SessionId, vid);
                                }
                                else {
                                    console.log("Request added to queue. sessionId :: " + requestObj.SessionId);
                                    callback(err, "Request added to queue. sessionId :: " + requestObj.SessionId, vid);
                                }
                            });
                            break;
                        case "DIRECT":
                            contArdsHandler.ContinueArds(requestObj, function (handlingResource) {
                                callback(err, handlingResource, vid);
                            });
                            break;
                        default:
                            callback(err, "No ReqHandlingAlgo Found.", vid);
                            break;
                    } 
                }
            });
        }
    });
};

var SetRequest = function (requestObj, cVid, callback) {
    var key = util.format('Request:%d:%d:%s', requestObj.Company, requestObj.Tenant, requestObj.SessionId);
    redisHandler.CheckObjExists(key, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null, 0);
        }
        else if (result == "1") {
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
        }
        else {            
            callback(null, "Set Failed- No Existing Obj", 0);
        }
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
            var tag = ["company_" + requestObj.Company, "tenant_" + requestObj.Tenant, "class_" + requestObj.Class, "type_" + requestObj.Type, "category_" + requestObj.Category, "objtype_Request", "sessionid_" + requestObj.SessionId, "reqserverid_" + requestObj.RequestServerId, "priority_" + requestObj.Priority, "servingalgo_" + requestObj.ServingAlgo, "handlingalgo_" + requestObj.HandlingAlgo, "selectionalgo_" + requestObj.SelectionAlgo];
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
            
            if (requestObj.ReqHandlingAlgo === "QUEUE") {
                reqQueueHandler.RemoveRequestFromQueue(requestObj.QueueId, requestObj.QueueId.SessionId, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            redisHandler.RemoveObj_V_T(key, tag, function (err, result) {
                if (err) {
                    callback(err, "false");
                }
                else {
                    var reqStateKey = util.format('RequestState:%d:%d:%s', company, tenant, sessionId);
                    redisHandler.RemoveObj(reqStateKey, function () { });
                    callback(null, result);
                }
            });
        }
    });
};

var RejectRequest = function (company, tenant, sessionId, reason, callback) {
    console.log("reject method hit :: SessionID: " + sessionId + " :: Reason: " + reason);
    var key = util.format('Request:%s:%s:%s', company, tenant, sessionId);
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var requestObj = JSON.parse(obj);
            var stags = ["company_"+company+"", "tenant_"+tenant+ "", "class_"+ requestObj.Class+ "", "type_"+ requestObj.Type+ "", "category_"+ requestObj.Category+ "", "objtype_CSlotInfo", "handlingrequest_"+sessionId+ ""];
            
            redisHandler.SearchObj_T(stags, function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (result.length == 1) {
                        var csObj = result[0];
                        resourceHandler.UpdateSlotStateAvailable(company, tenant, csObj.Class, csObj.Type, csObj.Category, csObj.ResourceId, csObj.SlotId, "Reject", function (err, reply) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            });

            SetRequestState(requestObj.Company, requestObj.Tenant, requestObj.SessionId, "QUEUED", function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err, "false");
                }
                else {
                    reqQueueHandler.ReAddRequestToQueue(requestObj, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback(err, "false");
                        }
                        else if (result == "OK") {
                            console.log("Request Readded to Queue Success");
                            callback(err, "true");
                        }
                        else {
                            console.log("Request Readded to Queue Failed");
                            callback(err, "false");
                        }
                    });
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

var SetRequestState = function (company, tenant, sessionId, state, callback) {
    var key = util.format('RequestState:%d:%d:%s', company, tenant, sessionId);
    redisHandler.SetObj(key, state, function (err, result) {
        if (err) {
            console.log(err);
        }
        callback(err, result);
    });
};

module.exports.AddRequest = AddRequest;
module.exports.SetRequest = SetRequest;
module.exports.RemoveRequest = RemoveRequest;
module.exports.RejectRequest = RejectRequest;
module.exports.GetRequest = GetRequest;
module.exports.SearchRequestByTags = SearchRequestByTags;
module.exports.AddProcessingRequest = AddProcessingRequest;
module.exports.SetRequestState = SetRequestState;
module.exports.GetProcessingRequest = GetProcessingRequest;
module.exports.RemoveProcessingRequest = RemoveProcessingRequest;
module.exports.SearchProcessingRequestByTags = SearchProcessingRequestByTags;
