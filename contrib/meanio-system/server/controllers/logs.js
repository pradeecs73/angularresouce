var winston = require('winston');
var config = require('meanio').loadConfig();
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var exports = {
    log: function(req, companyname, filename, loglevel, msg) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var url = req.method + " " + req.url;
        var logfilename = filename + "." + loglevel + ".log";
        var writingdir = path.resolve(config.logpath + '/' + companyname);
        var finalpath=path.resolve(writingdir+'/'+logfilename);

        var msg = JSON.stringify(msg);
        if (!fs.existsSync(writingdir)) {
            mkdirp(writingdir, function() {
                var logger = new winston.Logger({
                    levels: {
                        info: 1,
                        warn: 2,
                        error: 3
                    },
                    transports: [
                        new(winston.transports.File)({
                            filename: finalpath,
                            level: loglevel
                        }),
                    ]
                });
                logger.log(loglevel, msg, {
                    "ip": ip,
                    "request": url
                });
            });
        } else {
            var logger = new winston.Logger({
                levels: {
                    info: 1,
                    warn: 2,
                    error: 3
                },
                transports: [
                    new(winston.transports.File)({
                        filename: finalpath,
                        level: loglevel
                    }),
                ]
            });
            logger.log(loglevel, msg, {
                "ip": ip,
                "request": url
            });
        }
    },
    delta: function(req, companyname, filename, before, after) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var url = req.method + " " + req.url;
        var logfilename = filename + ".delta" + ".log";
        var writingdir = path.resolve(config.logpath + '/' + companyname);
        var finalpath=path.resolve(writingdir+'/'+logfilename);
        var before = JSON.stringify(before);
        var after = JSON.stringify(after);
        if (!fs.existsSync(writingdir)) {
            mkdirp(writingdir, function() {
                var logger = new winston.Logger({
                    levels: {
                        delta: 1
                    },
                    transports: [
                        new(winston.transports.File)({
                            filename: finalpath,
                            level: 'delta'
                        }),
                    ]
                });
                logger.log('delta', 'delta', {
                    "ip": ip,
                    "request": url,
                    "before": before,
                    "after": after
                });
            });
        } else {
            var logger = new winston.Logger({
                levels: {
                    delta: 1
                },
                transports: [
                    new(winston.transports.File)({
                        filename: finalpath,
                        level: 'delta'
                    }),
                ]
            });
            logger.log('delta', filename, {
                "ip": ip,
                "request": url,
                "before": before,
                "after": after
            });
        }
    }
};
module.exports = exports;