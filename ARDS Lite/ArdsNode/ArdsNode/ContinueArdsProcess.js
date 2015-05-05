var restClientHandler = require('./RestClient.js');
var configHandler = require('./Config.json');
var util = require('util');
var reqQueueHandler = require('./ReqQueueHandler.js');
var requestHandler = require('./RequestHandler.js');
var reqServerHandler = require('./ReqServerHandler.js');

var ContinueArds = function (request, callback) {
    var selectionResult = "";
    var handlingResource = "";
    
    if (request.ReqHandlingAlgo == "QUEUE") {
        console.log("Continue Queued Rqquest:: hResource : "+ request.HandlingResource);
        handlingResource = request.HandlingResource;

        DoReplyServing(request, handlingResource, function (reply) {
            callback(reply);
        });
    }
    else {
        var params = util.format('/resourceselection/getresource/%d/%d/%s/%s/%s/%s/%s/%s', request.Company, request.Tenant, request.SessionId, request.Class, request.Type, request.Category, request.SelectionAlgo, request.HandlingAlgo);
        restClientHandler.DoGet(configHandler.resourceSelectionUrl, params, function (err, res, obj) {            
            DoReplyServing(request, JSON.stringify(obj), function (reply) {
                callback(reply);
            });
        });
    }
};

var DoReplyServing = function (request, handlingResource, callback) {
    switch (request.ServingAlgo) {
        case "CALLBACK":
            if (handlingResource != "No matching resources at the moment") {
                var result = util.format('SessionId:: %s ::: HandlingResource:: %s', request.SessionId, handlingResource);
                console.log(result);
                requestHandler.SetRequestState(request.Company, request.Tenant, request.SessionId, "TRYING", function (err, result) {
                });
                
                if (request.ReqHandlingAlgo == "QUEUE") {
                    var pHashId = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
                    reqQueueHandler.SetNextProcessingItem(request.QueueId, pHashId);
                }
                
                var hrOtherData = JSON.parse(handlingResource);
                var postDataString = { SessionID: request.SessionId, Extention: hrOtherData.Extention, DialHostName: hrOtherData.DialHostName };
                reqServerHandler.SendCallBack(request.RequestServerUrl, postDataString, function (result, msg) {
                    if (result) {
                        if (msg == "readdRequired") {
                            requestHandler.RejectRequest(request.Company, request.Tenant, request.SessionId, "Send Callback failed.", function (err, result) {
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