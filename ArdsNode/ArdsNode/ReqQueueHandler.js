var util = require('util');
var redisHandler = require('./RedisHandler.js');
var requestHandler = require('./RequestHandler.js');

var AddRequestToQueue = function (request, callback) {
    var hashKey = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
    redisHandler.CheckHashFieldExists(hashKey, request.QueueId, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, "Failed");
        }
        else if (result == "1") {
            redisHandler.AddItemToListR(request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err, "Failed");
                }
                else {
                    if (parseInt(result) > 0) {
                        requestHandler.SetRequestState(request.Company, request.Tenant, request.SessionId, "QUEUED", function (err, result) {
                            console.log("set Request State QUEUED");
                        });
                        callback(err, "OK");
                    }
                    else {
                        callback(err, "Failed");
                    }
                }
            });
        }
        else {
            redisHandler.AddItemToHash(hashKey, request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err, "Failed");
                }
                else {
                    requestHandler.SetRequestState(request.Company, request.Tenant, request.SessionId, "QUEUED", function (err, result) {
                        console.log("set Request State QUEUED");
                    });
                    callback(err, "OK");
                }

            });
        }
    });
};

var ReAddRequestToQueue = function (request, callback) {
    var hashKey = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
    redisHandler.CheckHashFieldExists(hashKey, request.QueueId, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, "Failed");
        }
        else if (result == "1") {
            redisHandler.AddItemToListL(request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err, "Failed");
                }
                else {
                    if (parseInt(result) > 0) {
                        requestHandler.SetRequestState(request.Company, request.Tenant, request.SessionId, "QUEUED", function (err, result) {
                        });
                        callback(err, "OK");
                    }
                    else {
                        callback(err, "Failed");
                    }
                }
            });
        }
        else {
            redisHandler.AddItemToHash(hashKey, request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err, "Failed");
                }
                else {
                     requestHandler.SetRequestState(request.Company, request.Tenant, request.SessionId, "QUEUED", function (err, result) {
                    });
                    callback(err, "OK");
                }
            });
        }
    });
};

var RemoveRequestFromQueue = function (queueId, sessionId, callback) {
    redisHandler.RemoveItemFromList(queueId, sessionId, function (err, result) {
        if (err) {
            console.log(err);
        }
        callback(err, result);
    });
};

var GetNextRequestToProcess = function (queueId, callback) {
    redisHandler.GetItemFromList(queueId, function (err, result) {
        if (err) {
            console.log(err);
        }
        callback(err, result);
    });
};

var SetNextProcessingItem = function (queueId, processingHashId) {
    redisHandler.GetItemFromList(queueId, function (err, nextQueueItem) {
        if (err) {
            console.log(err);
        }
        else {
            if (nextQueueItem == "") {
                redisHandler.RemoveItemFromHash(processingHashId, queueId, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (result == "1") {
                            console.log("Remove HashField Success.." + _processingHash + "::" + _queueId);
                        }
                        else {
                            console.log("Remove HashField Failed.." + _processingHash + "::" + _queueId);
                        }
                    }
                });
            }
            else {
                redisHandler.AddItemToHash(processingHashId,queueId, nextQueueItem,function(err,result){
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (result == "1") {
                            console.log("Set HashField Success.." + _processingHash + "::" + _queueId + "::" + nextQueueItem);
                        }
                        else {
                            console.log("Set HashField Failed.." + _processingHash + "::" + _queueId + "::" + nextQueueItem);
                        }
                    }
                });
            }
        }
    });
};

module.exports.AddRequestToQueue = AddRequestToQueue;
module.exports.ReAddRequestToQueue = ReAddRequestToQueue;
module.exports.RemoveRequestFromQueue = RemoveRequestFromQueue;
module.exports.GetNextRequestToProcess = GetNextRequestToProcess;
module.exports.SetNextProcessingItem = SetNextProcessingItem;