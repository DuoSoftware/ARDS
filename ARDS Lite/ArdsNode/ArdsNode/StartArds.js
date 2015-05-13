﻿var util = require('util');
var redisHandler = require('../../.././Common/ArdsCommon/ArdsCommon/RedisHandler.js');
var sortArray = require('../../.././Common/ArdsCommon/ArdsCommon/SortArray.js');
var reqQueueHandler = require('../../.././Common/ArdsCommon/ArdsCommon/ReqQueueHandler.js');
var resourceHandler = require('../../.././Common/ArdsCommon/ArdsCommon/ResourceHandler.js');
var preProcessHandler = require('../../.././Common/ArdsCommon/ArdsCommon/PreProcessor.js');
var contArdsHandler = require('./ContinueArdsProcess.js');
var infoLogger = require('../../.././Common/ArdsCommon/ArdsCommon/InformationLogger.js');

var AddRequest = function (logKey, reqPreObj, callback) {
    preProcessHandler.execute(logKey, reqPreObj, function (err, requestObj) {
        if (err) {
            console.log(err);
        }
        else {
            infoLogger.DetailLogger.log('info', '%s ************************* Start AddRequest *************************', logKey);
            
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
            redisHandler.AddObj_V_T(logKey, key, jsonObj, tag, function (err, reply, vid) {
                if (err) {
                    console.log(err);
                    callback(err, null, 0);
                }
                else {
                    SetRequestState(logKey, requestObj.Company, requestObj.Tenant, requestObj.SessionId, "N/A", function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    switch (requestObj.ReqHandlingAlgo) {
                        case "QUEUE":
                            reqQueueHandler.AddRequestToQueue(logKey, requestObj, function (err, result) {
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


module.exports.AddRequest = AddRequest;