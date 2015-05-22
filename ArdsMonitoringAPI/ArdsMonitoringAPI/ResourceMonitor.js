var util = require('util');
var redisHandler = require('../.././ArdsCommon/ArdsCommon/redisHandler.js');
var requestHandler = require('../.././ArdsCommon/ArdsCommon/RequestHandler.js');
var infoLogger = require('../.././ArdsCommon/ArdsCommon/InformationLogger.js');

var SearchMatchingObjs = function (logKey, tags, callback) {
    requestHandler.SearchRequestByTags(logKey, tags, function (err, result) {
        var reqSearchResult = [];
        if (err) {
            callback(err, reqSearchResult);
        }
        else {
            for (var i in result) {
                var val = result[i];

                requestHandler.GetRequestState(logKey, val.Obj.Company, val.Obj.Tenant, val.Obj.SessionId, function (err, reqState) {
                    if (err) {
                    }
                    else {
                        var obj = { Request: JSON.parse(obj), State: JSON.parse(reqState), Vid: JSON.parse(vid) };
                        reqSearchResult.push(obj);
                    }
                });
            }
        }
    });
};