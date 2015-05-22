var resourceHandler = require('../../.././ArdsCommon/ArdsCommon/ResourceHandler.js');
var configHandler = require('../../.././ArdsCommon/ArdsCommon/Config.json');
var util = require('util');
var reqQueueHandler = require('../../.././ArdsCommon/ArdsCommon/ReqQueueHandler.js');
var requestHandler = require('../../.././ArdsCommon/ArdsCommon/RequestHandler.js');
var reqServerHandler = require('../../.././ArdsCommon/ArdsCommon/ReqServerHandler.js');
var infoLogger = require('../../.././ArdsCommon/ArdsCommon/InformationLogger.js');
var uuid = require('node-uuid');

var ContinueArds = function (request, callback) {
    var logkey = util.format('[%s]::[%s]', uuid.v1(), request.SessionId);
    infoLogger.ContArdsLogger.log('info', '%s ************************* Start ContinueArds *************************', logkey);

    var selectionResult = "";
    var handlingResource = "";
    
    if (request.ReqHandlingAlgo == "QUEUE") {
        console.log("Continue Queued Rqquest:: hResource : "+ request.HandlingResource);
        handlingResource = request.HandlingResource;

        DoReplyServing(logkey, request, handlingResource, function (reply) {
            callback(reply);
        });
    }
    else {
        resourceHandler.DoResourceSelection(request.Company, request.Tenant, request.SessionId, request.Class, request.Type, request.Category, request.SelectionAlgo, request.HandlingAlgo, function (err, res, obj) {
            DoReplyServing(logkey, request, JSON.stringify(obj), function (reply) {
                callback(reply);
            });
        });
    }
};

var DoReplyServing = function (logKey, request, handlingResource, callback) {
    infoLogger.ContArdsLogger.log('info', '%s ContinueArds. SessionId: %s :: SessionId: %s :: handlingResource: %s :: ServingAlgo: %s', logKey, request.SessionId, handlingResource, request.ServingAlgo);
                
    switch (request.ServingAlgo) {
        case "CALLBACK":
            if (handlingResource != "No matching resources at the moment") {
                var result = util.format('SessionId:: %s ::: HandlingResource:: %s', request.SessionId, handlingResource);
                console.log(result);
                requestHandler.SetRequestState(logkey, request.Company, request.Tenant, request.SessionId, "TRYING", function (err, result) {
                });
                
                if (request.ReqHandlingAlgo == "QUEUE") {
                    var pHashId = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
                    reqQueueHandler.SetNextProcessingItem(logkey, request.QueueId, pHashId);
                }
                
                var hrOtherData = JSON.parse(handlingResource);
                var postDataString = { SessionID: request.SessionId, Extention: hrOtherData.Extention, DialHostName: hrOtherData.DialHostName };
                reqServerHandler.SendCallBack(logkey, request.RequestServerUrl, postDataString, function (result, msg) {
                    if (result) {
                        if (msg == "readdRequired") {
                            requestHandler.RejectRequest(logkey, request.Company, request.Tenant, request.SessionId, "Send Callback failed.", function (err, result) {
                                if (err) {
                                    console.log("Readd Request to queue failed. SessionId:: " + request.SessionId);
                                }
                                else if ("true") {
                                    console.log("Readd Request to queue success. SessionId:: " + request.SessionId);
                                }
                                else {
                                    console.log("Readd Request to queue failed. SessionId:: " + request.SessionId);
                                }
                            });
                        }
                        console.log("SendCallBack success. SessionId:: " + request.SessionId);
                        console.log("CallbackFinishedTime: " + new Date().toISOString());
                    }
                    else {
                        console.log("SendCallBack failed. SessionId:: " + request.SessionId);
                    }
                });
            }
            callback(handlingResource);
            break;

        default:
            var result = util.format('SessionId:: %s ::: HandlingResource:: %s', request.SessionId, handlingResource);
            console.log(result);
            callback(handlingResource);
            break;
    }
};

module.exports.ContinueArds = ContinueArds;