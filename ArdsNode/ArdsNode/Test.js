var redisHandler = require('./RedisHandler.js');

//var tags = ["company_1", "tenant_3"];
//redisHandler.SearchObjByTags(tags, function (err, res) {
//    var result = res;
//    var obj1 = result[0].Obj;
//    var vid1 = result[0].Vid;
//});

redisHandler.AddItemToList("l1", "bbb", function (err, result) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(result);
    }
});