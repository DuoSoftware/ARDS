var winston = require('winston');
var config = require('./Config.json');

var ReqResLogger = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)({
        //    colorize: true
        //}),
        new (winston.transports.File)({
            filename: config.reqresLogger.filename,
            level: config.reqresLogger.level,
            json: config.reqresLogger.json,
            maxsize: config.reqresLogger.maxsize,
            maxFiles: config.reqresLogger.maxFiles
        })
    ]
});

var DetailLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: config.detailLogger.filename,
            level: config.detailLogger.level,
            json: config.detailLogger.json,
            maxsize: config.detailLogger.maxsize,
            maxFiles: config.detailLogger.maxFiles
        })
    ]
});

var ContArdsLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: config.contardsLogger.filename,
            level: config.contardsLogger.level,
            json: config.contardsLogger.json,
            maxsize: config.contardsLogger.maxsize,
            maxFiles: config.contardsLogger.maxFiles
        })
    ]
});

module.exports.ReqResLogger = ReqResLogger;
module.exports.DetailLogger = DetailLogger;
module.exports.ContArdsLogger = ContArdsLogger;