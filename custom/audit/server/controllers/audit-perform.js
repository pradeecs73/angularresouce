'use strict';
/*
 * <Author: Abha Singh> <Date: 11-07-2016> <Function: showPerformAudit, audit,
 * auditPerform, loadQuestions, performAudit > @param: {req.body}, {req.audit},
 * {req.auditPerform}
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    AuditCategoryModel = mongoose.model('AuditCategory'),
    AuditQuestionModel = mongoose.model('AuditQuestion'),
    _ = require('lodash');
module.exports = function(AuditPerformCtrl) {
    return {
        /**
         * Find audit by id
         */
        audit: function(req, res, next, id) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            AuditModel.load(id, function(err, audit) {
                if (err) {
                    return next(err);
                }
                if (!audit) {
                    return next(new Error('Failed to load audit ' + id));
                }
                req.audit = audit;
                next();
            });
        },
        /**
         * Find audit perform by id
         */
        auditPerform: function(req, res, next, id) {
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            AuditPerformModel.load(id, function(err, auditPerform) {
                if (err) {
                    return next(err);
                }
                if (!auditPerform) {
                    return next(new Error('Failed to load auditPerform ' + id));
                }
                req.auditPerform = auditPerform;
                next();
            });
        },
        /**
         * load Question based on category with pagination
         */
        loadQuestions: function(req, res) {
            AuditQuestionModel.find({
                audit_category: req.audit.audit_category
            }).sort({
                sequence: 1
            }).exec(function(err, auditQuestions) {
                if (err) {
                    res.status(500).json({
                        error: 'Cannot find the auditQuestions'
                    });
                }
                AuditCategoryModel.findOne({
                    _id: req.audit.audit_category
                }, function(err, auditCategory) {
                    req.audit.audit_category = auditCategory;
                    var loadQuestionObj = {};
                    loadQuestionObj.questions = auditQuestions;
                    loadQuestionObj.audit = req.audit;
                    res.json(loadQuestionObj);
                });
            });
        },
        /**
         * perform audit for company
         */
        performAudit: function(req, res) {
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            req.body.audit = req.audit._id;
            req.body.performed_By = req.user._id;
            req.body.company = req.user.company;
            var errors = [];
            var validationError = req.validationErrors()
            if (Array.isArray(validationError)) {
                errors = errors.concat(req.validationErrors());
            }
            var myarray = _.map(req.body.responses, 'answer');
            for (var j = 0; j < myarray.length; j++) {
                if (myarray[j] != "Yes" && myarray[j] != "No" && myarray[j] != "NA" && myarray[j] != "") {
                    var errorObj = {
                        "param": "answer",
                        "msg": "You must enter valid answer"
                    }
                    errors.push(errorObj);
                }
            }
            for (var i = 0; i < req.body.responses.length; i++) {
                if (req.body.responses[i].answer == "") {
                    var errorObj = {
                        "param": "answer",
                        "msg": "You must select answer for each question"
                    }
                    errors.push(errorObj)
                }
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            AuditModel.findOne({
                _id: req.body.audit
            }, function(err, audit) {
                if (err) {
                    res.status(500).json({
                        error: 'Cannot find the audit'
                    });
                } else {
                    audit.isPerformed = true;
                    audit.save(function(err) {
                        if (err) {
                            return res.status(400);
                        } else {
                            res.status(200);
                        }
                    });
                }
            });
            var auditPerform = new AuditPerformModel(req.body);
            auditPerform.save(function(err) {
                if (err) {
                    return res.status(400);
                } else {
                    res.json(auditPerform);
                }
            });
        },
        /**
         * show perform audit
         */
        performedAudit: function(req, res) {
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            res.json(req.auditPerform);
        },
        /**
         * load all the questions for a particular audit category
         */
        loadTotalQuestions: function(req, res) {
            AuditQuestionModel.find({
                audit_category: req.audit.audit_category
            }).exec(function(err, auditQuestions) {
                if (err) {
                    res.status(500).json({
                        error: 'Cannot find the auditQuestions'
                    });
                }
                var loadQuestionObj = {};
                loadQuestionObj.questions = auditQuestions;
                loadQuestionObj.audit = req.audit;
                res.json(loadQuestionObj);
            });
        },

        createTask: function(req, res) {
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            require('../../../../custom/securitytasks/server/models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            require('../../../../custom/securitytasks/server/models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            require('../../../../custom/securitytasks/server/models/log_hour')(req.companyDb);
            var LogHourModel = req.companyDb.model('LogHour');
            var errors = [];
            var errObj = {};
            if (req.body.name == undefined || req.body.name == '') {
                errObj = {
                    param: 'task_name',
                    msg: 'You must enter name  '
                }
                errors.push(errObj)
            }
            if (req.body.description == undefined || req.body.description == '') {
                errObj = {
                    param: 'description',
                    msg: 'You must enter description  '
                }
                errors.push(errObj)
            }
            if (req.body.responsible == undefined || req.body.responsible == '') {
                errObj = {
                    param: 'responsible',
                    msg: 'You must enter responsible  '
                }
                errors.push(errObj)
            }
            if (req.body.estimated_hour == undefined || req.body.estimated_hour == '') {
                errObj = {
                    param: 'estimated_hour',
                    msg: 'You must enter hour  '
                }
                errors.push(errObj)
            }
            if (req.body.cost == undefined || req.body.cost == '') {
                errObj = {
                    param: 'cost',
                    msg: 'You must enter cost  '
                }
                errors.push(errObj)
            }
            if (req.body.responsible_followUp == undefined || req.body.responsible_followUp == '') {
                errObj = {
                    param: 'responsible_followUp',
                    msg: 'You must enter follow up'
                }
                errors.push(errObj)
            }
            if (!req.body.directly) {
                if (!req.body.fixday) {
                    errObj = {
                        param: 'fixday',
                        msg: 'You must enter fixday  '
                    }
                    errors.push(errObj)
                }
            }
            if (errors.length) {
                return res.status(400).json(errors);
            } else {
                var securityCreate = {
                    "createdBy": req.user._id,
                    "task_name": req.body.name,
                    "description": req.body.description,
                    "responsible_action": req.body.responsible,
                    "responsible_followUp": req.body.responsible_followUp,
                    "deadline": new Date(),
                    "cost": req.body.cost,
                    "building": req.body.building,
                    "company": req.user.company
                }
                if (req.body.fixday == "Immediately") {
                    securityCreate.deadline = new Date();
                }
                if (req.body.fixday == "7 days") {
                    var TodayDate = new Date();
                    var numberOfDaysToAdd = 7;
                    TodayDate.setDate(TodayDate.getDate() + numberOfDaysToAdd);
                    securityCreate.deadline = TodayDate;
                }
                if (req.body.fixday == "30 days") {
                    var TodayDate = new Date();
                    var numberOfDaysToAdd = 30;
                    TodayDate.setDate(TodayDate.getDate() + numberOfDaysToAdd);
                    securityCreate.deadline = TodayDate;
                }
                if (req.body.directly) {
                    securityCreate.status = "true";
                }

                var securityTask = new SecurityTaskModel(securityCreate);
                securityTask.save(function(err) {
                    if (err) {
                        var modelErrors = [];
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
                        return res.status(400);
                    } else {
                        var subtaskCreate = {
                            "createdBy": req.user._id,
                            "name": req.body.name,
                            "security_task": securityTask._id,
                            "isPerformed": req.body.directly,
                            "estimated_hour": req.body.estimated_hour,
                            "building": req.body.building,
                            "assignTo": req.body.responsible,
                            "company": req.user.company
                        }
                        if (req.body.directly) {
                            subtaskCreate.isPerformed = "true";
                        }
                        var subTask = new SubTaskModel(subtaskCreate);
                        subTask.save(function(err) {
                            if (err) {
                                var modelErrors = [];
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
                                return res.status(400);
                            } else {
                                if (req.body.directly == true) {
                                    var addCost = {
                                        "company": req.user.company,
                                        "task": subTask._id,
                                        "actual_cost": req.body.cost,
                                        "createdBy": req.user._id
                                    }
                                    var cost = new CostModel(addCost);
                                    cost.save(function(err) {
                                        if (err) {
                                            var modelErrors = [];
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
                                            return res.status(400);
                                        } else {
                                            res.status(200);
                                        }
                                    });
                                    var addLog = {
                                        "company": req.user.company,
                                        "person": req.body.responsible,
                                        "task": subTask._id,
                                        "actual_time": req.body.estimated_hour,
                                        "createdBy": req.user._id
                                    }
                                    var logHour = new LogHourModel(addLog);
                                    logHour.save(function(err) {
                                        if (err) {
                                            var modelErrors = [];
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
                                            return res.status(400);
                                        } else {
                                            res.json(subTask);
                                        }
                                    });
                                } else {
                                    res.json(subTask);
                                }
                            }
                        });
                    }
                });
            }
        }
    };
}
