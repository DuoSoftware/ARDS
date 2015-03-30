var util = require('util');
var redisHandler = require('./RedisHandler.js');

var AddRequestToQueue = function (request, callback) {
    var hashKey = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
    redisHandler.CheckHashFieldExists(hashKey, request.QueueId, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, result);
        }
        else if (result == "1") {
            redisHandler.AddItemToListR(request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                }
                callback(err, result);
            });
        }
        else {
            redisHandler.AddItemToHash(hashKey, request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                }
                callback(err, result);
            });
        }
    });
};

var ReAddRequestToQueue = function (request, callback) {
    var hashKey = util.format('ProcessingHash:%d:%d', request.Company, request.Tenant);
    redisHandler.CheckHashFieldExists(hashKey, request.QueueId, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, result);
        }
        else if (result == "1") {
            redisHandler.AddItemToListL(request.QueueId, request.SessionId, function (err, result) {
                if (err) {
                    console.log(err);
                }
                callback(err, result);
            });
        }
        else {
            redisHandler.AddItemToHash(hashKey, request.QueueId, request, function (err, result) {
                if (err) {
                    console.log(err);
                }
                callback(err, result);
            });
        }
    });
};

var RemoveRequestFromQueue = function (request, callback) {
    redisHandler.RemoveItemFromList(request.QueueId, request.SessionId, function (err, result) {
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

module.exports.AddRequestToQueue = AddRequestToQueue;
module.exports.ReAddRequestToQueue = ReAddRequestToQueue;
module.exports.RemoveRequestFromQueue = RemoveRequestFromQueue;
module.exports.GetNextRequestToProcess = GetNextRequestToProcess;