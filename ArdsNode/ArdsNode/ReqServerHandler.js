﻿var util = require('util');
var redisHandler = require('./RedisHandler.js');

var AddRequestServer = function (reqServerObj, callback) {
    var key = util.format('ReqServer:%d:%d:%d', reqServerObj.Company, reqServerObj.Tenant, reqServerObj.ServerID);
    var tag = ["company_" + reqServerObj.Company, "tenant_" + reqServerObj.Tenant, "class_" + reqServerObj.Class, "type_" + reqServerObj.Type, "category_" + reqServerObj.Category, "objtype_ReqServer", "serverid_" + reqServerObj.ServerID];
    
    var obj = JSON.stringify(reqServerObj);
    
    redisHandler.AddObj_T(key, obj, tag, function (err, result) {
        callback(err, result);
    });
};

var SetRequestServer = function (reqServerObj, callback) {
    var key = util.format('ReqServer:%d:%d:%d', reqServerObj.Company, reqServerObj.Tenant, reqServerObj.ServerID);
    var tag = ["company_" + reqServerObj.Company, "tenant_" + reqServerObj.Tenant, "class_" + reqServerObj.Class, "type_" + reqServerObj.Type, "category_" + reqServerObj.Category, "objtype_ReqServer", "serverid_" + reqServerObj.ServerID];
    
    var obj = JSON.stringify(reqServerObj);
    
    redisHandler.SetObj_T(key, obj, tag, function (err, result) {
        callback(err, result);
    });
};

var GetRequestServer = function (company, tenant, serverId, callback) {
    var key = util.format('ReqServer:%s:%s:%s', company, tenant, serverId);
    redisHandler.GetObj(key, function (err, result) {
        callback(err, result);
    });
};

var SearchReqServerByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_ReqServer");
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

var RemoveRequestServer = function (company, tenant, serverId, callback) {
    var key = util.format('ReqServer:%s:%s:%s', company, tenant, serverId);
    
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var reqServerObj = JSON.parse(obj);
            var tag = ["company_" + reqServerObj.Company, "tenant_" + reqServerObj.Tenant, "class_" + reqServerObj.Class, "type_" + reqServerObj.Type, "category_" + reqServerObj.Category, "objtype_ReqServer", "serverid_" + reqServerObj.ServerID];
            
            redisHandler.RemoveObj_T(key, tag, function (err, result) {
                callback(err, result);
            });
        }
    });
};

module.exports.AddRequestServer = AddRequestServer;
module.exports.SetRequestServer = SetRequestServer;
module.exports.GetRequestServer = GetRequestServer;
module.exports.SearchReqServerByTags = SearchReqServerByTags;
module.exports.RemoveRequestServer = RemoveRequestServer;