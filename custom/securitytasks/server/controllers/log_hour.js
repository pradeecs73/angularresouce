'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    _ = require('lodash');

var validationLogHourFn = function(logHour, callback) {
    var errors = [];
    var errObj
    if (logHour.person == undefined || logHour.person == '') {
        errObj = {
            param: 'person',
            msg: 'You must enter person  '
        }
        errors.push(errObj)
    }
    if (logHour.task == undefined || logHour.task == '') {
        errObj = {
            param: 'task',
            msg: 'You must enter task  '
        }
        errors.push(errObj)
    }
    if (logHour.actual_time == undefined || logHour.actual_time == '') {
        errObj = {
            param: 'actual_time',
            msg: 'You must enter actual time  '
        }
        errors.push(errObj)
    }
    if (errors.length) {
        callback(errors, null);
    } else {
        logHour.save(function(err) {
            if (err) {
                switch (err.code) {
                    default: var modelErrors = [];
                    if (err.errors) {
                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }
                        callback(modelErrors, null);
                    }
                }
            } else {
                callback(null, logHour);
            }
        });

    }
};

module.exports = function(LogHour) {

    return {

        /**
         * Find logHour by id
         */
        logHour: function(req, res, next, id) {
            require('../models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            LogHourModel.load(id, function(err, logHour) {
                if (err) {
                    return next(err);
                }
                if (!logHour) {
                    return next(new Error('Failed to load logHour ' + id));
                }
                req.logHour = logHour;
                next();
            });
        },

        /**
         * Find Security Task by id
         */
        securityTask: function(req, res, next, id) {
            require('../models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            SecurityTaskModel.load(id, function(err, securityTask) {
                if (err) {
                    return next(err);
                }
                if (!securityTask) {
                    return next(new Error('Failed to load securityTask ' + id));
                }
                req.securityTask = securityTask;
                next();
            });
        },

        validationLogHour: function(newhourObj, callback) {
            validationLogHourFn(newhourObj, callback);
        },
        /**
         * Create Log Hour 
         */
        create: function(req, res) {
            require('../models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company;
            var hourObj = new LogHourModel(req.body);
            validationLogHourFn(hourObj, function(error, logHour) {
                if (error) {
                    return res.status(400).send(error)
                } else {
                    logHour = logHour.toJSON();
                    SubTaskModel.findOne({_id:logHour.task}, function(err, subTask) {
                        if (err){
                            //TODO: have to add logger
                            console.log(err);
                        }
                        logHour.task = subTask;
                        User.findOne({_id:logHour.person}, function(err, user) {
                            if (err) {
                                //TODO: have to add logger
                                console.log(err);
                            }
                            logHour.person = user
                            res.json(logHour);
                        })
                    })
                }
            });
        },

        /**
         * Delete a logHour
         */
        delete: function(req, res) {
            var logHour = req.logHour;
            logHour.remove(function(err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the logHour'
                    });
                }
                res.json(logHour);
            });
        },

        /**
         * calculate total time spent 
         */
        totalTime: function(req, res) {
            require('../models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            LogHourModel.find(function(err, logHours) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot find the logHour'
                    });
                }
                var totalTime = 0;
                async.eachSeries(logHours, function(logHour, callback) {
                    totalTime = logHour.actual_time + totalTime;
                    callback();
                }, function(err) {
                    res.json(totalTime);
                });
            });
        },

        /**
         *  Get all log hours
         */
        getAll: function(req, res) {
            var logHoursArray = {
                "loghour": [],
                "cost": []
            };
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            require('../models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            require('../models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            SubTaskModel.find({ security_task: req.securityTask._id }, function(err, subTasks) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Sub Tasks'
                    });
                }
                async.each(subTasks, function(subTask, callback) {
                    LogHourModel.find({ task: subTask._id }, function(err, logHours) {
                        if (err) {
                            return res.status(400).json({
                                error: 'Cannot list the Sub Tasks'
                            });
                        }
                        async.each(logHours, function(logHour, logCallback) {
                            logHour = logHour.toJSON();
                            logHour.task = subTask;
                            User.findOne({_id:logHour.person}, function(err, user) {
                                if (err){
                                    return res.status(400).json({
                                        error: 'Cannot get the Person'
                                    });
                                }
                                logHour.person = user
                                logHoursArray.loghour.push(logHour);
                                logCallback();
                            })
                        }, function(err){
                            callback();
                        })
                    })

                    CostModel.find({ task: subTask._id }, function(err, costs) {
                        if (err) {
                            return res.status(400).json({
                                error: 'Cannot list the Costs'
                            });
                        }
                        async.each(costs, function(cost, costCallback) {
                            cost = cost.toJSON();
                            cost.task = subTask;
                            logHoursArray.cost.push(cost);
                            costCallback();
                        }, function(err){

                        })
                    })
                }, function(err){
                    res.json(logHoursArray);
                })
            })
        },
    };
}
