var util = require('util');
var redisHandler = require('./RedisHandler.js');
var EventEmitter = require('events').EventEmitter;

var SetConcurrencyInfo = function (data) {
    var e = new EventEmitter();
    process.nextTick(function () {
        if (Array.isArray(data)) {
            var count = 0;
            for (var i in data) {
                var val = data[i];

                e.emit('concurrencyInfo', val);
                count++;
                
                if (data.length === count) {
                    e.emit('endconcurrencyInfo');
                }
            }
        }
        else {
            e.emit('endconcurrencyInfo');
        }
    });

    return (e);
};

var AddResource = function (basicData, callback) {
    var concurrencyInfo = [];
    var sci = SetConcurrencyInfo(basicData.ConcurrencyInfo);
    
    sci.on('concurrencyInfo', function (obj) {
        var concurrencySlotInfo = [];
        for (var i = 0; i < obj.NoOfSlots; i++) {
            var slotInfo = { Class: obj.Class, Type: obj.Type, Category: obj.Category, State: "Available", HandlingRequest: "" };
            concurrencySlotInfo.push(slotInfo);
        }
        var concurrencyObj = { Class: obj.Class, Type: obj.Type, Category: obj.Category, ConcurrencySlotInfo: concurrencySlotInfo, LastConnectedTime: "" };
        concurrencyInfo.push(concurrencyObj);
    });
    
    sci.on('endconcurrencyInfo', function () {
        var resourceObj = { Company: basicData.Company, Tenant: basicData.Tenant, Class: basicData.Class, Type: basicData.Type, Category: basicData.Category, ResourceId: basicData.ResourceId, ResourceAttributeInfo: basicData.ResourceAttributeInfo, ConcurrencyInfo: concurrencyInfo, State: "Available" };

        var key = util.format('Resource:%d:%d:%s', resourceObj.Company, resourceObj.Tenant, resourceObj.ResourceId);
        var tag = ["company_" + resourceObj.Company, "tenant_" + resourceObj.Tenant, "class_" + resourceObj.Class, "type_" + resourceObj.Type, "category_" + resourceObj.Category, "objtype_Resource", "resourceid_" + resourceObj.ResourceId];
        for (var i in resourceObj.ResourceAttributeInfo) {
            tag.push("attribute_" + resourceObj.ResourceAttributeInfo[i].Attribute);
        }
        var jsonObj = JSON.stringify(resourceObj);

        redisHandler.AddObj_V_T(key, jsonObj, tag, function (err, reply, vid) {
            callback(err, reply, vid);
        });
    });
};

var RemoveResource = function (company, tenant, resourceId, callback) {
    var key = util.format('Resource:%s:%s:%s', company, tenant, resourceId);
    redisHandler.GetObj(key, function (err, obj) {
        if (err) {
            callback(err, "false");
        }
        else {
            var resourceObj = JSON.parse(obj);
            var tag = ["company_" + resourceObj.Company, "tenant_" + resourceObj.Tenant, "class_" + resourceObj.Class, "type_" + resourceObj.Type, "category_" + resourceObj.Category, "objtype_Resource", "resourceid_" + resourceObj.ResourceId];
            for (var i in resourceObj.ResourceAttributeInfo) {
                tag.push("attribute_" + resourceObj.ResourceAttributeInfo[i].Attribute);
            }

            redisHandler.RemoveObj_V_T(key, tag, function (err, result) {
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

var SetResource = function (basicObj, cVid, callback) {
    var concurrencyInfo = [];
    var sci = SetConcurrencyInfo(basicData.ConcurrencyInfo);
    
    sci.on('concurrencyInfo', function (obj) {
        var concurrencySlotInfo = [];
        for (var i = 0; i < obj.NoOfSlots; i++) {
            var slotInfo = { Class: obj.Class, Type: obj.Type, Category: obj.Category, State: "Available", HandlingRequest: "" };
            concurrencySlotInfo.push(slotInfo);
        }
        var concurrencyObj = { Class: obj.Class, Type: obj.Type, Category: obj.Category, ConcurrencySlotInfo: concurrencySlotInfo, LastConnectedTime: "" };
        concurrencyInfo.push(concurrencyObj);
    });
    
    sci.on('endconcurrencyInfo', function () {
        var resourceObj = { Company: basicData.Company, Tenant: basicData.Tenant, Class: basicData.Class, Type: basicData.Type, Category: basicData.Category, ResourceId: basicData.ResourceId, ResourceAttributeInfo: basicData.ResourceAttributeInfo, ConcurrencyInfo: concurrencyInfo, State: "Available" };
        
        var key = util.format('Resource:%d:%d:%s', resourceObj.Company, resourceObj.Tenant, resourceObj.ResourceId);
        var tag = ["company_" + resourceObj.Company, "tenant_" + resourceObj.Tenant, "class_" + resourceObj.Class, "type_" + resourceObj.Type, "category_" + resourceObj.Category, "objtype_Resource", "resourceid_" + resourceObj.ResourceId];
        for (var i in resourceObj.ResourceAttributeInfo) {
            tag.push("attribute_" + resourceObj.ResourceAttributeInfo[i].Attribute);
        }
        var jsonObj = JSON.stringify(resourceObj);
        
        redisHandler.SetObj_V_T(key, jsonObj, tag, cVid, function (err, reply, vid) {
            callback(err, reply, vid);
        });
    });
};

var GetResource = function (company, tenant, resourceId, callback) {
    var key = util.format('Resource:%s:%s:%s', company, tenant, resourceId);
    redisHandler.GetObj_V(key, function (err, result, vid) {
        callback(err, result, vid);
    });
};

var SearchResourcebyTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_Resource");
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

module.exports.AddResource = AddResource;
module.exports.SetResource = SetResource;
module.exports.RemoveResource = RemoveResource;
module.exports.GetResource = GetResource;
module.exports.SearchResourcebyTags = SearchResourcebyTags;