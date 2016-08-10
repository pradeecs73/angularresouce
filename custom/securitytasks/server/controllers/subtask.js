'use strict';
/**
 * <Author:Mahesh Goud>
 * <Date:22-07-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete & undo soft delete for subtask>
 * @params: req.body & req.accessSystem   
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash');
var config = require('../../../../custom/actsec/server/config/config.js');
var async = require('async');

var createSubTaskFn = function(newSubtask, callback) {
    require('../models/subtask')(newSubtask.companyDB);
    var SubTaskModel = newSubtask.companyDB.model('SubTask');
    var subtaskObj = new SubTaskModel(newSubtask);
    var errors = [];
    var errObj
    if (newSubtask.company == undefined || newSubtask.company == '') {
        errObj = {
            param: 'company',
            msg: 'You must enter a company'
        }
        errors.push(errObj)
    }
    if (newSubtask.name == undefined || newSubtask.name == '') {
        errObj = {
            param: 'name',
            msg: 'You must enter a name'
        }
        errors.push(errObj)
    }
    if (newSubtask.building == undefined || newSubtask.building == '') {
        errObj = {
            param: 'building',
            msg: 'You must enter a building'
        }
        errors.push(errObj)
    }
    if (newSubtask.security_task == undefined || newSubtask.security_task == '') {
        errObj = {
            param: 'security_task',
            msg: 'You must enter a security task'
        }
        errors.push(errObj)
    }
    if (newSubtask.createdBy == undefined || newSubtask.createdBy == '') {
        errObj = {
            param: 'createdBy',
            msg: 'You must enter a created By'
        }
        errors.push(errObj)
    }
    if (newSubtask.estimated_hour == undefined || newSubtask.estimated_hour == '') {
        errObj = {
            param: 'estimated_hour',
            msg: 'You must enter estimated hours'
        }
        errors.push(errObj)
    }
    if (errors.length > 0) {
        callback( null, errors);
    } else {
        delete subtaskObj.companyDB;
        subtaskObj.save(function(err) {
            subtaskObj.save(function(err, subtaskout) {
                if (err) {
                    callback(null, err);
                } else {
                    callback(null, subtaskout)
                }
            });
        });
    }
}
module.exports = function(Securitytask) {
    return {
        /**
         * Find SubTask by id
         */
        subtask: function(req, res, next, id) {
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            SubTaskModel.load(id, function(err, subtask) {
                if (err) {
                    return next(err);
                }
                if (!subtask) {
                    return next(new Error('Failed to load SubTask ' + id));
                }
                req.subtask = subtask;
                next();
            });
        },

        /**
         * Find Security Task by id
         */
        securitytask: function(req, res, next, id) {
            require('../models/securitytask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SubTask');
            SecurityTaskModel.load(id, function(err, user) {
                if (err) {
                    return next(err);
                }
                if (!securitytask) {
                    return next(new Error('Failed to load securitytask ' + id));
                }
                req.securitytask = securitytask;
                next();
            });
        },

        createSubTask: function(newSubtask, callback) {
            createSubTaskFn(newSubtask, callback);
        },
        /**
         * Create of SubTask
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            var subtaskObj = req.body;
            subtaskObj.companyDB = req.companyDb;
            createSubTaskFn(subtaskObj, function(error, subtaskResult) {
                if (error) {
                    res.json(error);
                } else {
                    res.json(subtaskResult);
                }
            });
        },
        /**
         * load all SubTask
         */
        all: function(req, res) {
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            SubTaskModel.find({
                security_task: req.params.securitytaskId
            }).exec(function(err, subtasks) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the securitytasks'
                    });
                }
                res.json(subtasks);
            });
        },
        /**
         * Updates the SubTask
         */
        update: function(req, res) {
            if ((req.user.role._id + '' == config.roles.SECURITY_MANAGER) || (req.user._id + '') == req.subtask.assignTo) {
                require('../models/subtask')(req.companyDb);
                var SubTaskModel = req.companyDb.model('SubTask');
                req.body.updatedBy = req.user._id;
                var subtask = req.subtask;
                subtask.isPerformed = req.body.isPerformed;
                if (subtask.isPerformed == true || subtask.isPerformed == false) {
                    subtask.save(function(err) {
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
                                    res.status(400).json(modelErrors);
                                }
                            }
                            return res.status(400);
                        } else res.json(subtask);
                    });
                } else {
                    return res.status(400).send({
                        errors: [{
                            param: 'isPerformed',
                            msg: 'This action cannot be performed.'
                        }]
                    });
                }
            } else {
                return res.status(401).send([{
                    "permission": 'Access denied'
                }]);
            }
        },

        /**
         * Delete of Subtask
         */
         destroy: function(req, res) {
            if (req.user.role._id == config.roles.SECURITY_MANAGER) {
                var hoursArray = [];
                var costsArray = [];
                require('../models/subtask')(req.companyDb);
                var SubTaskModel = req.companyDb.model('SubTask');
                require('../models/log_hour')(req.companyDb);
                var LogHourModel = req.companyDb.model('LogHour');
                require('../models/cost')(req.companyDb);
                var CostModel = req.companyDb.model('Cost');
                var subTask = req.subtask;

                var deleteLogHour = function(hourCallback){
                    LogHourModel.find({task: subTask._id}, function(err, logHours) {
                        if (err) {
                            //TODO: Have to implement logger
                            console.log(err)
                        }
                        async.each(logHours, function(logHour, callback) {
                            hoursArray.push(logHour);
                            logHour.remove(function(err){
                                if (err){
                                    //TODO: Have to implement logger
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err){
                            hourCallback();
                        })
                    })
                };
                var deleteCost = function(costCallback){
                    CostModel.find({task: subTask._id}, function(err, costs) {
                        if (err) {
                            //TODO: Have to implement logger
                            console.log(err)
                        }
                        async.each(costs, function(cost, callback) {
                            costsArray.push(cost)
                            cost.remove(function(err){
                                if (err){
                                    //TODO: Have to implement logger
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err){
                            costCallback();
                        })
                    })
                };
                async.waterfall([
                    deleteLogHour,
                    deleteCost,
                ], function(error) {
                    subTask.remove(function(err) {
                        if (err) {
                            return res.status(400).json({
                                error: 'Cannot delete the sub task'
                            });
                        }
                        subTask = subTask.toJSON();
                        subTask.hours = hoursArray;
                        subTask.costs = costsArray;
                        res.json(subTask);
                    });
                });
            } else {
                res.status(403).json("Unauthorised")
            }
        },
    };
}