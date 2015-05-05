//var restClientHandler = require('./RestClient.js');

//restClientHandler.DoGet("http://localhost:2225", "/requestserver/get/1/3/1", function () {
//});

//var pd = "{\"Company\": 1,\"Tenant\": 3,\"Class\": \"TESTERVER\",\"Type\": \"ARDS\",\"Category\": \"CALL\",\"CallbackUrl\": \"http://localhost:5426/Callback\",\"ServerID\": 2}";
//restClientHandler.DoPost("http://localhost:2225/requestserver/add", JSON.parse(pd), function () {
//});

//var configHandler = require('./Config.json');
//console.log(configHandler.basicSelectionUrl);
//console.log("");
//var util = require('util');
//var key = "Resource:1:3:555555555";
//var lockKey = util.format('%s', key.split(":").join(""));
//console.log("key:: " + key);
//console.log("lockKey:: " + lockKey);

var restify = require('restify');

var server = restify.createServer({
    name: 'Test2',
    version: '1.0.0'
});
//var internalserver = restify.createServer({
//    name: 'internalserverArdsServer',
//    version: '1.0.0'
//});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/callback/print', function (req, res, next) {
    var resString = JSON.stringify(req.body);
    console.log(resString);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end("true");
    return next();
});

server.listen(2228, function () {
    console.log('%s listening at %s', server.name, server.url);
});
