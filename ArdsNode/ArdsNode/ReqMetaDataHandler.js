var util = require('util');
var redisHandler = require('./RedisHandler.js');

var AddMeataData = function (metaDataObj, callback) {
    var key = util.format('ReqMETA:%d:%d:%s:%s:%s', metaDataObj.Company, metaDataObj.Tenant, metaDataObj.Class, metaDataObj.Type, metaDataObj.Category);
    var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
    var obj = JSON.stringify(reqServerObj);
    
    redisHandler.AddObj_T(key, obj, tag, function (err, result) {
        callback(err, result);
    });
};

var SetMeataData = function (reqServerObj, callback) {
    var key = util.format('ReqMETA:%d:%d:%s:%s:%s', metaDataObj.Company, metaDataObj.Tenant, metaDataObj.Class, metaDataObj.Type, metaDataObj.Category);
    var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
    var obj = JSON.stringify(reqServerObj);
    
    redisHandler.SetObj_T(key, obj, tag, function (err, result) {
        callback(err, result);
    });
};

var GetMeataData = function (company, tenant, mclass, type, category, callback) {
    var key = util.format('ReqMETA:%s:%s:%s:%s:%s', company, tenant, mclass, type, category);
    redisHandler.GetObj(key, function (err, result) {
        callback(err, result);
    });
};

var SearchMeataDataByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_ReqMETA");
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

var RemoveMeataData = function (company, tenant, mclass, type, category, callback) {
    var key = util.format('ReqMETA:%s:%s:%s:%s:%s', company, tenant, mclass, type, category);
    
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var metaDataObj = JSON.parse(obj);
            var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
            redisHandler.RemoveObj_T(key, tag, function (err, result) {
                callback(err, result);
            });
        }
    });
};

module.exports.AddMeataData = AddMeataData;
module.exports.SetMeataData = SetMeataData;
module.exports.GetMeataData = GetMeataData;
module.exports.SearchMeataDataByTags = SearchMeataDataByTags;
module.exports.RemoveMeataData = RemoveMeataData;