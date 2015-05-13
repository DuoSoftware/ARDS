var util = require('util');
var redisHandler = require('./RedisHandler.js');
var infoLogger = require('./InformationLogger.js');

var AddMeataData = function (logKey, metaDataObj, callback) {
    infoLogger.DetailLogger.log('info', '%s ************************* Start AddMeataData *************************', logKey);

    var key = util.format('ReqMETA:%d:%d:%s:%s:%s', metaDataObj.Company, metaDataObj.Tenant, metaDataObj.Class, metaDataObj.Type, metaDataObj.Category);
    var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
    var obj = JSON.stringify(metaDataObj);
    
    redisHandler.AddObj_T(logKey, key, obj, tag, function (err, result) {
        infoLogger.DetailLogger.log('info', '%s Finished AddMeataData. Result: %s', logKey, result);
        callback(err, result);
    });
};

var SetMeataData = function (logKey, metaDataObj, callback) {
    infoLogger.DetailLogger.log('info', '%s ************************* Start SetMeataData *************************', logKey);

    var key = util.format('ReqMETA:%d:%d:%s:%s:%s', metaDataObj.Company, metaDataObj.Tenant, metaDataObj.Class, metaDataObj.Type, metaDataObj.Category);
    var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
    var obj = JSON.stringify(metaDataObj);
    
    redisHandler.SetObj_T(logKey, key, obj, tag, function (err, result) {
        infoLogger.DetailLogger.log('info', '%s Finished SetMeataData. Result: %s', logKey, result);
        callback(err, result);
    });
};

var GetMeataData = function (logKey, company, tenant, mclass, type, category, callback) {
    infoLogger.DetailLogger.log('info', '%s ************************* Start GetMeataData *************************', logKey);

    var key = util.format('ReqMETA:%s:%s:%s:%s:%s', company, tenant, mclass, type, category);
    redisHandler.GetObj(logKey, key, function (err, result) {
        infoLogger.DetailLogger.log('info', '%s Finished GetMeataData. Result: %s', logKey, result);
        callback(err, result);
    });
};

var SearchMeataDataByTags = function (logKey, tags, callback) {
    infoLogger.DetailLogger.log('info', '%s ************************* Start SearchMeataDataByTags *************************', logKey);

    if (Array.isArray(tags)) {
        tags.push("objtype_ReqMETA");
        redisHandler.SearchObj_T(logKey, tags, function (err, result) {
        infoLogger.DetailLogger.log('info', '%s Finished SearchMeataDataByTags. Result: %s', logKey, result);
        callback(err, result);
        });
    }
    else {
        var e = new Error();
        e.message = "tags must be a string array";
        infoLogger.DetailLogger.log('info', '%s Finished SearchMeataDataByTags. Result: tags must be a string array', logKey);
        callback(e, null);
    }
};

var RemoveMeataData = function (logKey, company, tenant, mclass, type, category, callback) {
    infoLogger.DetailLogger.log('info', '%s ************************* Start RemoveMeataData *************************', logKey);

    var key = util.format('ReqMETA:%s:%s:%s:%s:%s', company, tenant, mclass, type, category);
    
    redisHandler.GetObj(logKey, key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var metaDataObj = JSON.parse(obj);
            var tag = ["company_" + metaDataObj.Company, "tenant_" + metaDataObj.Tenant, "class_" + metaDataObj.Class, "type_" + metaDataObj.Type, "category_" + metaDataObj.Category, "objtype_ReqMETA"];
    
            redisHandler.RemoveObj_T(logKey, key, tag, function (err, result) {
                infoLogger.DetailLogger.log('info', '%s Finished RemoveMeataData. Result: %s', logKey, result);
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