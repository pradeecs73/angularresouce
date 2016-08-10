'use strict';
/*
 * <Author:Akash Gupta>
 * <Date:25-07-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Delete for Security Tasks>
 * @params: req.body & req.securityTask      Contain new or updated details of Security tasks
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    subTaskController = require('./subtask.js')(subTaskController),
    configuration = require('../../../actsec/server/config/config.js'),
    multiparty = require('multiparty'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    fs = require('fs'),
    _ = require('lodash');
var path = require('path');
var mime = require('mime');
module.exports = function(Securitytasks) {
    return {
        /**
         * Find Security Tasks by id
         */
        securityTask: function(req, res, next, id) {
            require('../models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            SecurityTaskModel.load(id, function(err, securityTask) {
                if (err) {
                    return next(err);
                }
                if (!securityTask) {
                    return next(new Error('Failed to load security task ' + id));
                }
                req.securityTask = securityTask;
                next();
            });
        },
        /**
         * Create of Security task
         */
        create: function(req, res) {
            if (req.user.role._id == configuration.roles.SECURITY_MANAGER){
                require('../models/securityTask')(req.companyDb);
                var SecurityTaskModel = req.companyDb.model('SecurityTask');
                require('../models/subtask')(req.companyDb);
                var SubTaskModel = req.companyDb.model('SubTask');
                req.body.createdBy = req.user._id;
                req.body.company = req.user.company._id;
                var securityTask = new SecurityTaskModel(req.body);
                var validation = function(validationCallback) {
                    req.assert('task_name', 'Please enter Security task name').notEmpty();
                    req.assert('description', 'Please enter Security task description').notEmpty();
                    req.assert('cost', 'Please enter Security task cost').matches('^[1-9][0-9]*$');
                    req.assert('deadline', 'Please enter deadline date').notEmpty();
                    req.assert('building', 'Please select any building').notEmpty();
                    req.assert('responsible_followUp', 'Please select person responsible for Follow up').notEmpty();
                    req.assert('responsible_action', 'Please select person responsible for Action').notEmpty();
                    var errors = [];
                    var validationError = req.validationErrors();
                    if (Array.isArray(validationError)) {
                        errors = errors.concat(req.validationErrors());
                    }
                    if (req.body.subTasks == undefined || req.body.subTasks == 0) {
                        var valError = {
                            param: 'subTasks',
                            msg: 'Please create Subtasks'
                        };
                        errors.push(valError)
                    }
                    if (errors.length > 0) {
                        return res.status(400).send(errors);
                    }
                    validationCallback();
                };

                var initializeSubtask = function(callbackSubtask) {
                    var subTasks = req.body.subTasks;
                    async.each(subTasks, function(subTask, callback) {
                        subTask.company = req.user.company._id;
                        subTask.security_task = securityTask._id;
                        subTask.createdBy = req.user._id;
                        subTask.building = securityTask.building;
                        subTask.companyDB = req.companyDb;
                        callbackSubtask(null, subTask)
                    }, function(err) {

                    })
                };

                async.waterfall([
                    validation,
                    initializeSubtask,
                    subTaskController.createSubTask,
                ], function(error, response) {
                    if (Array.isArray(response) == false) {
                        securityTask.save(function(err) {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                res.json(securityTask);
                            }
                        });
                    } else {
                        SubTaskModel.find({ security_task: securityTask._id }, function(SubTasks) {
                            if (SubTasks != null && SubTasks.length > 0) {
                                async.each(SubTasks, function(subTask, callback) {
                                    subTask.remove({ $softRemove: false }, function(err) {
                                        if (err) {}
                                        callback();
                                    }, function(err) {
                                        res.status(400).json(response)
                                    })
                                });
                            } else {
                                res.status(400).json(response)
                            }
                        })
                    }
                })
            } else {
                res.status(403).json('unauthorized');
            }
        },

        /**
         * Update a Security Tasks
         */
        update: function(req, res) {
            if (req.body.status == false && req.user.role._id == configuration.roles.SECURITY_MANAGER) {
                require('../models/securityTask')(req.companyDb);
                var SecurityTaskModel = req.companyDb.model('SecurityTask');
                require('../models/subtask')(req.companyDb);
                var SubTaskModel = req.companyDb.model('SubTask');
                require('../models/log_hour')(req.companyDb);
                var LogHourModel = req.companyDb.model('LogHour');
                require('../models/cost')(req.companyDb);
                var CostModel = req.companyDb.model('Cost');
                req.body.updatedBy = req.user._id;
                var securityTask = req.securityTask;
                securityTask = _.extend(securityTask, req.body);

                req.assert('task_name', 'Please enter Security task name').notEmpty();
                req.assert('description', 'Please enter Security task description').notEmpty();
                req.assert('cost', 'Please enter Security task cost').notEmpty();
                req.assert('deadline', 'Please enter deadline date').notEmpty();
                req.assert('building', 'Please select any building').notEmpty();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                if (securityTask.completedAt) {
                    securityTask.status = true;
                    var hasHours = false;
                    var hasCosts = false;
                    SubTaskModel.find({security_task: securityTask._id}, function(err, subTasks){
                        async.each(subTasks, function(subTask, SubtaskCallback) {
                            LogHourModel.find({task: subTask._id}, function(err, logHours) {
                                if (logHours.length>0) {
                                    hasHours = true;
                                }
                                CostModel.find({task: subTask._id}, function(err, costs) {
                                    if (costs.length>0) {
                                        hasCosts = true;
                                    }
                                    if (hasCosts == true && hasHours == true) {
                                        SubtaskCallback('break');
                                    } else {
                                        SubtaskCallback();
                                    }
                                })
                            })
                        }, function(err){
                            if (hasCosts == true && hasHours == true){
                                securityTask.save(function(err) {
                                    if (err) {
                                        return res.status(500).send(err);
                                    } else {
                                        res.json(securityTask);
                                    }
                                })
                            } else {
                                var obj = {
                                    hasCost: hasCosts,
                                    hasHour: hasHours
                                }
                                res.status(400).json(obj);
                            }
                        })
                    })
                } else {
                    var populateUser = function(userCallback) {
                        User.find({_id: securityTask.responsible_action}, function(err, responsibleUser){
                            User.find({_id: securityTask.responsible_followUp}, function(err, followUpUser){
                                userCallback(null, responsibleUser, followUpUser);
                            })
                        })
                    };

                    async.waterfall([
                        populateUser,
                    ], function(error, responsibleUser, followUpUser) {
                        securityTask.save(function(err) {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                securityTask = securityTask.toJSON();
                                if (responsibleUser.length>0) {
                                    securityTask.responsible_action = responsibleUser[0];
                                }
                                if (followUpUser.length>0) {
                                    securityTask.responsible_followUp = followUpUser[0];
                                }
                                res.json(securityTask);
                            }
                        })
                    })
                }
            } else {
                res.status(403).json("Unauthorised")
            }
        },
        /**
         * Show a Security Task
         */
        show: function(req, res) {
            res.json(req.securityTask);
        },
        /**
         * List of Security Tasks
         */
        all: function(req, res) {
            require('../models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            var array = [];
            var securityTaskArray = [];
            //All list of security tasks
            var allTasks = function(allTaskCallback) {
                if (JSON.stringify(req.user.role._id) === JSON.stringify(configuration.roles.SECURITY_MANAGER)) {
                    SecurityTaskModel.find({
                        company: req.user.company._id
                    }, function(err, securityTasks) {
                        if (err) {
                            return res.status(400).json(err);
                        }
                        async.eachSeries(securityTasks, function(securityTask, callback) {
                            securityTask = securityTask.toJSON();
                            User.findOne({ _id: securityTask.responsible_action }, function(err, userObj) {
                                if (err) {
                                    res.status(400).send(err);
                                    callback();
                                } else {
                                    securityTask.responsible_action = userObj;
                                    User.findOne({
                                        _id: securityTask.responsible_followUp
                                    }, function(err, userObj) {
                                        if (err) {
                                            res.status(400).send(err);
                                            callback();
                                        } else {
                                            securityTask.responsible_followUp = userObj;
                                            securityTaskArray.push(securityTask);
                                            callback();
                                        }
                                    });
                                }
                            });
                        }, function(err) {
                            allTaskCallback(null, securityTaskArray);
                        })
                    });
                } else {
                    allTaskCallback(null, securityTaskArray);
                }
            };
            var myTask = function(allTasks, myTaskCallback) {
                var myTaskArray = [];
                SecurityTaskModel.find({
                    company: req.user.company._id,
                    responsible_action: req.user._id
                }, function(err, myTasks) {
                    if (err) {
                        return res.status(400).json(err);
                    }
                    async.eachSeries(myTasks, function(myTaskObj, callback) {
                        myTaskObj = myTaskObj.toJSON();
                        User.findOne({
                            _id: myTaskObj.responsible_action
                        }, function(err, userObj) {
                            if (err) {
                                res.status(400).send(err);
                                callback();
                            } else {
                                myTaskObj.responsible_action = userObj;
                                User.findOne({ _id: myTaskObj.responsible_followUp }, function(err, userObj) {
                                    if (err) {
                                        res.status(400).send(err);
                                        callback();
                                    } else {
                                        myTaskObj.responsible_followUp = userObj;
                                        myTaskArray.push(myTaskObj);
                                        callback();
                                    }
                                });
                            }
                        });
                    }, function(err) {
                        myTaskCallback(null, allTasks, myTaskArray);
                    })
                });
            };
            var externalSecurityTask = function(securityTaskArray, myTaskArray, externalCallback) {
                ExternalSecurityTaskModel.find({
                    company: req.user.company._id,
                }, function(err, externalTasks) {

                    if (err) {
                        return res.status(400).json(err);
                    }
                    if (JSON.stringify(req.user.role._id) === JSON.stringify(configuration.roles.SECURITY_MANAGER)) {
                        array.push({
                            "alltask": securityTaskArray,
                            "mytask": myTaskArray,
                            "externalTask": externalTasks
                        })
                    } else {
                        array.push({
                            "mytask": myTaskArray
                        })
                    }
                    externalCallback(null, array)
                })
            };
            async.waterfall([
                allTasks,
                myTask,
                externalSecurityTask,
            ], function(error, data) {
                res.json(data);
            });
        },
        user: function(req, res) {
            User.find({
                company: req.user.company._id,
                buildings: {
                    $in: [req.params.buildingId]
                }
            }, function(err, users) {
                if (err) {
                    res.status(400).send(err)
                } else {
                    res.json(users);
                }
            })
        },
         
        /**
         * List of Security Tasks and External Security tasks
         */
        
        budget:function(req,res){
        	var securityTaskArray = {
        			"securitytask":[],
        			"externaltask":[]
        	};
        	var totalCost = 0;
        	var totalHours = 0;
        	require('../models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            require('../models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            require('../models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
           
                if (JSON.stringify(req.user.role._id) === JSON.stringify(configuration.roles.SECURITY_MANAGER)) {
                    SecurityTaskModel.find({ company: req.user.company._id }, function(err, securityTasks) {
                        if (err) {
                            return res.status(500).json(err);
                        }
                        else{
                        	async.eachSeries(securityTasks, function(securityTask, securityTaskcallback) {
                        		if(securityTask.status){
                                securityTask = securityTask.toJSON();
                                securityTask.subtask = [];
                                User.findOne({_id:securityTask.responsible_action}, function(err, userObj){
                                	if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot populate the responsible person'
                                        });
                                    }
                                	securityTask.responsible_action = userObj
	                                SubTaskModel.find({ security_task: securityTask._id }, function(err, subTasks) {
	                                    if (err) {
	                                        return res.status(500).json({
	                                            error: 'Cannot list the Sub Tasks'
	                                        });
	                                    }
	                                    var subTaskHour = 0;
	                                    var subTaskCost = 0;
	                                    async.each(subTasks, function(subTask, callback) {
	                                    	subTask = subTask.toJSON();
	                                    	subTask.loghours = [];
	                                    	subTask.cost = [];
	                                        LogHourModel.find({ task: subTask._id }, function(err, logHours) {
	                                            if (err) {
	                                                return res.status(500).json({
	                                                    error: 'Cannot list the log hours'
	                                                });
	                                            }
	                                            async.each(logHours, function(logHour, logCallback) {
	                                                logHour = logHour.toJSON();
	                                                User.findOne({_id:logHour.person}, function(err, user) {
	                                                    if (err){
	                                                        return res.status(500).json({
	                                                            error: 'Cannot get the Person'
	                                                        });
	                                                    }
	                                                    logHour.person = user
	                                                    totalHours = totalHours + logHour.actual_time
	                                                    subTask.loghours.push(logHour);
	                                                    subTaskHour = subTaskHour + logHour.actual_time;
	                                                    logCallback();
	                                                })
	                                                
	                                            }, function(err){
	                                            	securityTask.totalActualHour = subTaskHour;
	                                            	 CostModel.find({ task: subTask._id }, function(err, costs) {
	                                                     if (err) {
	                                                         return res.status(500).json({
	                                                             error: 'Cannot list the Costs'
	                                                         });
	                                                     }
	                                                     async.each(costs, function(cost, costCallback) {
	                                                         cost = cost.toJSON();
	                                                         totalCost = totalCost +cost.actual_cost;
	                                                         subTask.cost.push(cost);
	                                                         subTaskCost = subTaskCost + cost.actual_cost;
	                                                         costCallback();
	                                                     }, function(err){
	                                                    	 securityTask.totalActualCost = subTaskCost;
	                                                    	 securityTask.subtask.push(subTask);
	                                                         callback();
	                                                     })
	                                                 })
	                                            })
	                                        })
	                                        
	                                    }, function(err){
	                                    	securityTaskArray.securitytask.push(securityTask);
	                                        securityTaskcallback();
	                                    })
	                                })
                                })
                        	}  
                            }, function(err) {
                            	ExternalSecurityTaskModel.find().exec(function(err, externalSecurityTasks) {
                                    if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot list the External Security Tasks'
                                        });
                                    }
                                    async.each(externalSecurityTasks, function(externalSecurityTask, externalCallback) {
                                    	if(externalSecurityTask.status == "APPROVED"){
                                    	externalSecurityTask = externalSecurityTask.toJSON();
                                    	totalCost = totalCost + externalSecurityTask.actual_cost;
                                    	totalHours = totalHours + externalSecurityTask.actual_hours;
                                    	securityTaskArray.totalhours = totalHours; 
                                    	securityTaskArray.totalcost = totalCost;
                                    	securityTaskArray.externaltask.push(externalSecurityTask);
                                    }
                                    	externalCallback();
                                    }, function(err){
                                    	res.json(securityTaskArray);
                                    })
                                });
                            	
                            })
                        }
                    })
           }

        },
        
        attachInvoice: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/securitytaskUpload/", files.file[0].originalFilename, function(filepath) {
                        res.send(filepath);
                    });
                }
            });
        },
        
        riskBasedonLocation: function(req, res) {
            require('../../../risks/server/models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            RiskModel.find({ building: req.params.buildingId }, function(err, risks) {
                if (err) {
                    res.status(400).send(err)
                } else {
                    res.json(risks);
                }
            })
        }
 
}
}