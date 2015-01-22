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

var RemoveConcurrencyInfo = function (data, callback) {
    for (var i in data) {
        redisHandler.GetObj(data[i], function (err, tempObj) {
            var slotInfoTags = [];
            var obj = JSON.parse(tempObj);
            if (obj.ObjKey.search(/^(ConcurrencyInfo)[^\s]*/) != -1) {
                slotInfoTags = ["company_" + obj.Company, "tenant_" + obj.Tenant, "class_" + obj.Class, "type_" + obj.Type, "category_" + obj.Category, "resourceid_" + obj.ResourceId, "objtype_ConcurrencyInfo"];
            }
            else {
                slotInfoTags = ["company_" + obj.Company, "tenant_" + obj.Tenant, "class_" + obj.Class, "type_" + obj.Type, "category_" + obj.Category, "state_" + obj.State, "resourceid_" + obj.ResourceId, "objtype_CSlotInfo", "slotid_" + obj.SlotId];
            }

            redisHandler.RemoveObj_V_T(obj.ObjKey, slotInfoTags, function (err, result) {
                if (err) {
                    console.log(err);
                }
            });
        });
    }
};

var AddResource = function (basicData, callback) {
    var concurrencyInfo = [];
    var sci = SetConcurrencyInfo(basicData.ConcurrencyInfo);
    
    sci.on('concurrencyInfo', function (obj) {
        var concurrencySlotInfo = [];
        for (var i = 0; i < obj.NoOfSlots; i++) {
            var slotInfokey = util.format('CSlotInfo:%d:%d:%s:%s:%s:%s:%d', basicData.Company, basicData.Tenant, basicData.ResourceId, obj.Class, obj.Type, obj.Category, i);
            var slotInfo = { Company: basicData.Company, Tenant: basicData.Tenant, Class: obj.Class, Type: obj.Type, Category: obj.Category, State: "Available", HandlingRequest: "", ResourceId: basicData.ResourceId, SlotId: i, ObjKey: slotInfokey };
            var slotInfoTags = ["company_" + slotInfo.Company, "tenant_" + slotInfo.Tenant, "class_" + slotInfo.Class, "type_" + slotInfo.Type, "category_" + slotInfo.Category, "state_" + slotInfo.State, "resourceid_" + basicData.ResourceId, "objtype_CSlotInfo", "slotid_" + i];
            concurrencyInfo.push(slotInfokey);

            var jsonSlotObj = JSON.stringify(slotInfo);
            redisHandler.AddObj_V_T(slotInfokey, jsonSlotObj, slotInfoTags, function (err, reply, vid) {
                if (err) {
                    console.log(err);
                }
            });
        }
        var cObjkey = util.format('ConcurrencyInfo:%d:%d:%s:%s:%s:%s', basicData.Company, basicData.Tenant, basicData.ResourceId, obj.Class, obj.Type, obj.Category);
        var concurrencyObj = { Company: basicData.Company, Tenant: basicData.Tenant, Class: obj.Class, Type: obj.Type, Category: obj.Category, LastConnectedTime: "", ResourceId: basicData.ResourceId, ObjKey: cObjkey };
        var cObjTags = ["company_" + concurrencyObj.Company, "tenant_" + concurrencyObj.Tenant, "class_" + concurrencyObj.Class, "type_" + concurrencyObj.Type, "category_" + concurrencyObj.Category, "resourceid_" + basicData.ResourceId, "objtype_ConcurrencyInfo"];
        concurrencyInfo.push(cObjkey);

        var jsonConObj = JSON.stringify(concurrencyObj);
        redisHandler.AddObj_V_T(cObjkey, jsonConObj, cObjTags, function (err, reply, vid) {
            if (err) {
                console.log(err);
            }
        });
    });
    
    sci.on('endconcurrencyInfo', function () {
        var resourceObj = { Company: basicData.Company, Tenant: basicData.Tenant, Class: basicData.Class, Type: basicData.Type, Category: basicData.Category, ResourceId: basicData.ResourceId, ResourceAttributeInfo: basicData.ResourceAttributeInfo, ConcurrencyInfo: concurrencyInfo };

        var key = util.format('Resource:%d:%d:%s', resourceObj.Company, resourceObj.Tenant, resourceObj.ResourceId);
        var tag = ["company_" + resourceObj.Company, "tenant_" + resourceObj.Tenant, "class_" + resourceObj.Class, "type_" + resourceObj.Type, "category_" + resourceObj.Category, "objtype_Resource", "resourceid_" + resourceObj.ResourceId];
        for (var i in resourceObj.ResourceAttributeInfo) {
            tag.push("attribute_" + resourceObj.ResourceAttributeInfo[i].Attribute);
        }
        var jsonObj = JSON.stringify(resourceObj);

        redisHandler.AddObj_V_T(key, jsonObj, tag, function (err, reply, vid) {
            var StateKey = util.format('ResourceState:%d:%d:%s', resourceObj.Company, resourceObj.Tenant, resourceObj.ResourceId);
            redisHandler.SetObj(StateKey, "Available", function (err, result) {
            });
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
            RemoveConcurrencyInfo(resourceObj.ConcurrencyInfo, function () {
            });
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
    var key = util.format('Resource:%d:%d:%s', resourceObj.Company, resourceObj.Tenant, resourceObj.ResourceId);
    
    redisHandler.GetObj(key, function (err, jobj) {
        if (err) {
            console.log(err);
        }
        else {
            var obj = JSON.parse(jobj);
            var resourceObj = { Company: basicData.Company, Tenant: basicData.Tenant, Class: basicData.Class, Type: basicData.Type, Category: basicData.Category, ResourceId: basicData.ResourceId, ResourceAttributeInfo: basicData.ResourceAttributeInfo, ConcurrencyInfo: obj.ConcurrencyInfo, State: obj.State };
            
            var tag = ["company_" + resourceObj.Company, "tenant_" + resourceObj.Tenant, "class_" + resourceObj.Class, "type_" + resourceObj.Type, "category_" + resourceObj.Category, "objtype_Resource", "resourceid_" + resourceObj.ResourceId];
            for (var i in resourceObj.ResourceAttributeInfo) {
                tag.push("attribute_" + resourceObj.ResourceAttributeInfo[i].Attribute);
            }
            var jsonObj = JSON.stringify(resourceObj);
            
            redisHandler.SetObj_V_T(key, jsonObj, tag, cVid, function (err, reply, vid) {
                callback(err, reply, vid);
            });
        }
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

var UpdateLastConnectedTime = function (company, tenant, cinfoclass, type, category, resourceid, callback) {
    var cObjkey = util.format('ConcurrencyInfo:%d:%d:%s:%s:%s:%s', company, tenant, resourceid, cinfoclass, type, category);
    var date = new Date();

    redisHandler.GetObj_V(cObjkey, function (err, obj, vid) {
        if (err) {
            console.log(err);
        }
        else {
            var cObj = JSON.parse(obj);
            cObj.LastConnectedTime = date.toString();
            var jCObj = JSON.stringify(cObj);
            var cObjTags = ["company_" + cObj.Company, "tenant_" + cObj.Tenant, "class_" + cObj.Class, "type_" + cObj.Type, "category_" + cObj.Category, "resourceid_" + cObj.ResourceId, "objtype_ConcurrencyInfo"];
        
            redisHandler.SetObj_V_T(cObjkey, jCObj, cObjTags, vid, function () {
                callback(err, result, vid);
            });
        }
    });
};

var UpdateSlotStateAvailable = function (company, tenant, slotclass, type, category, resourceid, slotid, callback) {
    var slotInfokey = util.format('CSlotInfo:%s:%s:%s:%s:%s:%s:%s', company, tenant, resourceid, slotclass, type, category, slotid);
    redisHandler.GetObj_V(slotInfokey, function (err, obj, vid) {
        if (err) {
            console.log(err);
            callback(err, false);
        }
        else {
            var tempObj = JSON.parse(obj);
            tempObj.State = "Available";
            var slotInfoTags = ["company_" + tempObj.Company, "tenant_" + tempObj.Tenant, "class_" + tempObj.Class, "type_" + tempObj.Type, "category_" + tempObj.Category, "state_" + tempObj.State, "resourceid_" + tempObj.ResourceId, "objtype_CSlotInfo", "slotid_" + tempObj.SlotId];
            var jsonObj = JSON.stringify(tempObj);
            redisHandler.SetObj_V_T(slotInfokey, jsonObj, slotInfoTags, vid, function (err, reply, vid) {
                callback(err, reply);
            });
        }
    });
};

var UpdateSlotStateReserved = function (company, tenant, slotclass, type, category, resourceid, slotid, callback) {
    var slotInfokey = util.format('CSlotInfo:%s:%s:%s:%s:%s:%s:%s', company, tenant, resourceid, slotclass, type, category, slotid);
    redisHandler.GetObj_V(slotInfokey, function (err, obj, vid) {
        if (err) {
            console.log(err);
            callback(err, false);
        }
        else {
            var tempObj = JSON.parse(obj);
            tempObj.State = "Reserved";
            var slotInfoTags = ["company_" + tempObj.Company, "tenant_" + tempObj.Tenant, "class_" + tempObj.Class, "type_" + tempObj.Type, "category_" + tempObj.Category, "state_" + tempObj.State, "resourceid_" + tempObj.ResourceId, "objtype_CSlotInfo", "slotid_" + tempObj.SlotId];
            var jsonObj = JSON.stringify(tempObj);
            redisHandler.SetObj_V_T(slotInfokey, jsonObj, slotInfoTags, vid, function (err, reply, vid) {
                callback(err, reply);
            });
        }
    });
};

var UpdateSlotStateConnected = function (company, tenant, slotclass, type, category, resourceid, slotid, callback) {
    var slotInfokey = util.format('CSlotInfo:%s:%s:%s:%s:%s:%s:%s', company, tenant, resourceid, slotclass, type, category, slotid);
    redisHandler.GetObj_V(slotInfokey, function (err, obj, vid) {
        if (err) {
            console.log(err);
            callback(err, false);
        }
        else {
            var tempObj = JSON.parse(obj);
            tempObj.State = "Connected";
            var slotInfoTags = ["company_" + tempObj.Company, "tenant_" + tempObj.Tenant, "class_" + tempObj.Class, "type_" + tempObj.Type, "category_" + tempObj.Category, "state_" + tempObj.State, "resourceid_" + tempObj.ResourceId, "objtype_CSlotInfo", "slotid_" + tempObj.SlotId];
            var jsonObj = JSON.stringify(tempObj);
            redisHandler.SetObj_V_T(slotInfokey, jsonObj, slotInfoTags, vid, function (err, reply, vid) {
                callback(err, reply);
            });
        }
    });
};

var SearchCSlotByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_CSlotInfo");
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

var SearchConcurrencyInfoByTags = function (tags, callback) {
    if (Array.isArray(tags)) {
        tags.push("objtype_ConcurrencyInfo");
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

module.exports.UpdateLastConnectedTime = UpdateLastConnectedTime;
module.exports.UpdateSlotStateAvailable = UpdateSlotStateAvailable;
module.exports.UpdateSlotStateReserved = UpdateSlotStateReserved;
module.exports.UpdateSlotStateConnected = UpdateSlotStateConnected;
module.exports.SearchCSlotByTags = SearchCSlotByTags;
module.exports.SearchConcurrencyInfoByTags = SearchConcurrencyInfoByTags;