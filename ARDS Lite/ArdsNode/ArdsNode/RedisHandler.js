var redis = require('redis');
var util = require('util');
var EventEmiter = require('events').EventEmitter;
var configHandler = require('./Config.json');

client = redis.createClient(6379, configHandler.redisip);
client.select(configHandler.redisdb, function () { /* ... */ });
client.on("error", function (err) {
    console.log("Error " + err);
});

var SetTags = function (tagKey, objKey, callback) {
    var tagMeta = util.format('tagMeta:%s', objKey);
    client.get(tagMeta, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            if (result == null) {
                client.set(tagKey, objKey, function (err, reply) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        client.set(tagMeta, tagKey, function (err, reply) {
                            if (err) {
                                client.del(tagKey, function (err, reply) {
                                });
                            }
                            callback(err, reply);
                        });
                    }
                });
            }
            else {
                client.del(result, function (err, reply) {
                    if (err) {
                        console.log(error);
                        callback(err, null)
                    }
                    else if (reply === 1) {
                        client.set(tagKey, objKey, function (err, reply) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                client.set(tagMeta, tagKey, function (err, reply) {
                                    if (err) {
                                        client.del(tagKey, function (err, reply) {
                                        });
                                    }
                                    callback(err, reply);
                                });
                            }
                        });
                    }
                    else {
                        console.log("del failed" + result);
                        callback(null, "Failed");
                    }
                });
            }            
        }
    });
};

var SetObj = function (key, obj, callback) {
    client.set(key, obj, function (error, reply) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, reply);
        }
    });
};

var RemoveObj = function (key, callback) {
    client.del(key, function (err, reply) {
        if (err) {
            console.log(error);
        }
        else if (reply === 1) {
            callback(null, "true");
        }
        else {
            callback(null, "false");
        }
    });
};

var GetObj = function (key, callback) {
    client.get(key, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
                callback(null, result);
        }
    });
};


var AddObj_T = function (key, obj, tags, callback) {
    var vid = 1;
    if (Array.isArray(tags)) {
        var tagkey = util.format('tag:%s', tags.join(":"));

        SetTags(tagkey, key, function (err, reply) {
            if (err)
                console.log(error);
            else if (reply === "OK") {
                
                client.set(key, obj, function (error, reply) {
                    if (error) {
                        console.log(error);
                        client.del(tagkey, function (err, reply) {
                        });
                        client.del(versionkey, function (err, reply) {
                        });
                    }
                    else {
                        callback(null, reply);
                    }
                });
            }
        });
    }
    
};

var SetObj_T = function (key, obj, tags, callback) {
    if (Array.isArray(tags)) {
        var tagkey = util.format('tag:%s', tags.join(":"));
        SetTags(tagkey, key, function (err, reply) {
            if (err)
                console.log(error);
            else if (reply === "OK") {
                client.set(key, obj, function (error, reply) {
                    if (error)
                        console.log(error);
                    else {
                        callback(null, reply);
                    }
                });
            }
        });
    }
};

var RemoveObj_T = function (key, tags, callback) {
    if (Array.isArray(tags)) {
        var tagMeta = util.format('tagMeta:%s', key);
        client.get(tagMeta, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                client.del(result, function (err, reply) { });
                client.del(tagMeta, function (err, reply) { });
            }
        });
        
    }
    
    client.del(key, function (err, reply) {
        if (err) {
            console.log(error);
        }
        else if (reply === 1) {
            callback(null, "true");
        }
        else {
            callback(null, "false");
        }
    });
};

var GetObjByTagKey_T = function (tagKeys) {
    var e = new EventEmiter();
    var count = 0;
    for (var i in tagKeys) {
        var val = tagKeys[i];
        console.log("    " + i + ": " + val);
        client.get(val, function (err, key) {
            console.log("Key: " + key);
            
            GetObj(key, function (err, obj) {
                e.emit('result', err, obj);
                count++;
                
                console.log("res", count);
                
                if (tagKeys.length === count) {
                    console.log("end", count);
                    e.emit('end');
                }
            });
        });
    }
    return (e);
};

var SearchObj_T = function (tags, callback) {
    var result = [];
    var searchKey = util.format('tag:*%s*', tags.join("*"));
    
    client.keys(searchKey, function (err, replies) {
        console.log(replies.length + " replies:");
        
        var gobtk = GetObjByTagKey_T(replies);
        
        gobtk.on('result', function (err, obj) {
            var obj = JSON.parse(obj);
            result.push(obj);
        });
        
        gobtk.on('end', function () {
            callback(null, result);
        });

    });
};


var AddObj_V = function (key, obj, callback) {
    var vid = 1;
    var versionkey = util.format('version:%s', key);
    client.set(versionkey, vid, function (err, reply) {
        if (err) {
            console.log(error);
            client.del(tagkey, function (err, reply) {
            });
        }
        else if (reply === "OK") {
            client.set(key, obj, function (error, reply) {
                if (error) {
                    console.log(error);
                    client.del(tagkey, function (err, reply) {
                    });
                    client.del(versionkey, function (err, reply) {
                    });
                }
                else {
                    callback(null, reply, vid);
                }
            });
        }
    });    
};

var SetObj_V = function (key, obj, cvid, callback) {
    var versionkey = util.format('version:%s', key);
    client.get(versionkey, function (err, reply) {
        if (err)
            console.log(err);
        else if (reply === null) {
            AddObj_V(key, obj, callback);
        }
        else if (reply === cvid) {
            var versionkey = util.format('version:%s', key);
            client.incr(versionkey, function (err, reply) {
                if (err)
                    console.log(error);
                else {
                    var vid = reply
                    client.set(key, obj, function (error, reply) {
                        if (error)
                            console.log(error);
                        else {
                            callback(null, reply, vid);
                        }
                    });
                }
            });
        }
        else {
            callback(null, "VERSION_MISMATCHED", cvid);
        }
    });
};

var RemoveObj_V = function (key, callback) {
    var versionkey = util.format('version:%s', key);
    client.del(versionkey, function (err, reply) { });
    
    client.del(key, function (err, reply) {
        if (err) {
            console.log(error);
        }
        else if (reply === 1) {
            callback(null, "true");
        }
        else {
            callback(null, "false");
        }
    });
};

var GetObj_V = function (key, callback) {
    client.get(key, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null, 0);
        } else {
            var versionkey = util.format('version:%s', key);
            client.get(versionkey, function (err, vresult) {
                if (err) {
                    console.log(err);
                    callback(err, null, 0);
                } else {
                    callback(null, result, vresult);
                }
            });
        }
    });
};


var AddObj_V_T = function (key, obj, tags, callback) {
    var vid = 1;
    if (Array.isArray(tags)) {
        var tagkey = util.format('tag:%s', tags.join(":"));
        SetTags(tagkey, key, function (err, reply) {
            if (err)
                console.log(error);
            else if (reply === "OK") {
                var versionkey = util.format('version:%s', key);
                client.set(versionkey, vid, function (err, reply) {
                    if (err) {
                        console.log(error);
                        client.del(tagkey, function (err, reply) {
                        });
                    }
                    else if (reply === "OK") {
                        client.set(key, obj, function (error, reply) {
                            if (error) {
                                console.log(error);
                                client.del(tagkey, function (err, reply) {
                                });
                                client.del(versionkey, function (err, reply) {
                                });
                            }
                            else {
                                callback(null, reply, vid);
                            }
                        });
                    }
                });
            }
        });
    }
    
};

var SetObj_V_T = function (key, obj, tags, cvid, callback) {
    var versionkey = util.format('version:%s', key);
    client.get(versionkey, function (err, reply) {
        if (err)
            console.log(err);
        else if (reply === null) {
            AddObj_V_T(key, obj, tags, callback);
        }
        else if (reply === cvid) {
            if (Array.isArray(tags)) {
                var tagkey = util.format('tag:%s', tags.join(":"));
                SetTags(tagkey, key, function (err, reply) {
                    if (err)
                        console.log(error);
                    else if (reply === "OK") {
                        var versionkey = util.format('version:%s', key);
                        client.incr(versionkey, function (err, reply) {
                            if (err)
                                console.log(error);
                            else {
                                var vid = reply
                                client.set(key, obj, function (error, reply) {
                                    if (error)
                                        console.log(error);
                                    else {
                                        callback(null, reply, vid);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            callback(null, "VERSION_MISMATCHED", cvid);
        }
    });
};

var RemoveObj_V_T = function (key, tags, callback) {
    if (Array.isArray(tags)) {
        var tagMeta = util.format('tagMeta:%s', key);
        client.get(tagMeta, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                client.del(result, function (err, reply) { });
                client.del(tagMeta, function (err, reply) { });
            }
        });
    }
    
    var versionkey = util.format('version:%s', key);
    client.del(versionkey, function (err, reply) { });
    
    client.del(key, function (err, reply) {
        if (err) {
            console.log(error);
            callback(err, "false");
        }
        else if (reply === 1) {
            callback(null, "true");
        }
        else {
            callback(null, "false");
        }
    });
};

var GetObjByTagKey_V_T = function (tagKeys) {
    var e = new EventEmiter();
    var count = 0;
    for (var i in tagKeys) {
        var val = tagKeys[i];
        console.log("    " + i + ": " + val);
        client.get(val, function (err, key) {
            console.log("Key: " + key);
            
            GetObj_V(key, function (err, obj, vid) {
                e.emit('result', err, obj, vid);
                count++;
                
                console.log("res", count);
                
                if (tagKeys.length === count) {
                    console.log("end", count);
                    e.emit('end');
                }
            });
        });
    }
    return (e);
};

var SearchObj_V_T = function (tags, callback) {
    var result = [];
    var searchKey = util.format('tag:*%s*', tags.join("*"));
    
    client.keys(searchKey, function (err, replies) {
        console.log(replies.length + " replies:");
        
        var gobtk = GetObjByTagKey_V_T(replies);
        
        gobtk.on('result', function (err, obj, vid) {
            var obj = { Obj: JSON.parse(obj), Vid: JSON.parse(vid) };
            result.push(obj);
        });
        
        gobtk.on('end', function () {
            callback(null, result);
        });

    });
};


var CheckObjExists = function (key, callback) {
    client.exists(key, function (error, reply) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, reply);
        }
    });
};


var AddItemToListR = function (key, obj, callback) {
    client.rpush(key, obj, function (error, reply) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, reply);
        }
    });
};

var AddItemToListL = function (key, obj, callback) {
    client.lpush(key, obj, function (error, reply) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, reply);
        }
    });
};

var GetItemFromList = function (key, callback) {
    client.lpop(key, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var RemoveItemFromList = function (key, obj, callback) {
    client.lrem(key, 0, obj, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};


var AddItemToHash = function (hashKey, field, obj, callback) {
    client.hset(hashKey, field, obj, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var RemoveItemFromHash = function (hashKey, field, callback) {
    client.hdel(hashKey, field, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var RemoveHash = function (hashKey, callback) {
    client.del(hashKey, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var CheckHashFieldExists = function (hashkey, field, callback) {
    client.hexists(hashkey, field, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var GetHashValue = function(hashkey, field, callback) {
    client.hexists(hashKey, field, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var GetAllHashValue = function (hashkey, callback) {
    client.hvals(hashKey, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

module.exports.SetObj = SetObj;
module.exports.RemoveObj = RemoveObj;
module.exports.GetObj = GetObj;

module.exports.AddObj_T = AddObj_T;
module.exports.SetObj_T = SetObj_T;
module.exports.RemoveObj_T = RemoveObj_T;
module.exports.SearchObj_T = SearchObj_T;

module.exports.AddObj_V = AddObj_V;
module.exports.SetObj_V = SetObj_V;
module.exports.RemoveObj_V = RemoveObj_V;
module.exports.GetObj_V = GetObj_V;

module.exports.AddObj_V_T = AddObj_V_T;
module.exports.SetObj_V_T = SetObj_V_T;
module.exports.RemoveObj_V_T = RemoveObj_V_T;
module.exports.SearchObj_V_T = SearchObj_V_T;

module.exports.CheckObjExists = CheckObjExists;

module.exports.AddItemToListR = AddItemToListR;
module.exports.AddItemToListL = AddItemToListL;
module.exports.GetItemFromList = GetItemFromList;
module.exports.RemoveItemFromList = RemoveItemFromList;

module.exports.AddItemToHash = AddItemToHash;
module.exports.RemoveItemFromHash = RemoveItemFromHash;
module.exports.CheckHashFieldExists = CheckHashFieldExists;
module.exports.GetHashValue = GetHashValue;
module.exports.GetAllHashValue = GetAllHashValue;
module.exports.RemoveHash = RemoveHash;