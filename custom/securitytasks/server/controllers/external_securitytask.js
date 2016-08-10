'use strict';
/**
 * Name : External Security task Controller Description : In this controller Audits are created
 * by the super admin and Security Manager for a particular company. @ <author>
 * Sanjana @ <date> 11-July-2016 @ METHODS: create, show, update, approvalEstimateTask,approvedOrdeclinedTask
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    mail = require('../../../../contrib/meanio-system/server/services/mailService.js'),
    nodemailer = require('nodemailer'),
    templates = require('../../../../custom/actsec/server/config/externalTask_template.js'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');
var async = require('async');
var UserModel = mongoose.model('User');
var configuration = require('../../../../custom/actsec/server/config/config.js');

function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err)
            return err;
        return response;
    });
};

module.exports = function(ExternalSecurityTaskCtrl) {

    return {

        /**
         * Find externalSecurityTask by id
         */

        externalSecurityTask: function(req, res, next, id) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            ExternalSecurityTaskModel.load(id, function(err, externalSecurityTask) {
                if (err) {
                    return next(err);
                }
                if (!externalSecurityTask) {
                    return next(new Error('Failed to load externalSecurityTask ' + id));
                }
                req.externalSecurityTask = externalSecurityTask;
                next();
            });
        },

        /**
         * Create a new external security task
         */
        create: function(req, res) {
            var isActual = false;
            if (JSON.stringify(req.user.role._id) === JSON.stringify(configuration.roles.SECURITY_MANAGER)) {
                require('../models/external_securitytask')(req.companyDb);
                var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
                req.body.createdBy = req.user._id;
                var externalSecurityTask = new ExternalSecurityTaskModel(req.body);

                var validation = function(callbackValidation) {
                    req.assert('task_name', 'Please enter task name').notEmpty();
                    req.assert('description', 'Please enter description').notEmpty();
                    req.assert('email', 'Please enter a valid email').isEmail();

                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    } else {
                        callbackValidation();
                    }
                };

                async.waterfall([validation], function(err) {
                    var save = true;
                    if (req.body.value == "Cancel") {
                        externalSecurityTask.status = "APPROVED";
                    } else {
                        externalSecurityTask.status = "FOR_ESTIMATE";
                    }
                    externalSecurityTask.company = req.body.company_id;
                    externalSecurityTask.save(function(err) {
                        if (err) {
                            save = false;
                            return res.status(400);
                        } else {
                            res.json(externalSecurityTask);
                        }
                    });
                    if (save) {
                        if (req.body.value == "Cancel") {
                            var email = templates.external_user_approved(externalSecurityTask);
                            mail.mailService(email, externalSecurityTask.email)
                        } else {
                            var email = templates.external_user(externalSecurityTask);
                            mail.mailService(email, externalSecurityTask.email);
                        }
                    }
                });
            } else {
                res.status(401).json('Unauthorised');
            }
        },



        /**
         * Update a external security task by an external user
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            var externalSecurityTask = req.externalSecurityTask;
            externalSecurityTask = _.extend(externalSecurityTask, req.body);
            req.assert('task_name', 'Please enter task name').notEmpty();
            req.assert('description', 'Please enter description').notEmpty();
            req.assert('email', 'Please enter email').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            externalSecurityTask.save(function(err) {
                if (err) {} else {
                    res.send(externalSecurityTask);
                }

            });

        },
        /**
         * Show a External Security Task
         */
        show: function(req, res) {
            res.json(req.externalSecurityTask);
        },


        /**
         * Send for approval of external task after estimation of hours and cost
         */

        approvalEstimateTask: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');

            var saveExternalTask = function(callbackDone) {
                ExternalSecurityTaskModel.findOne({ _id: req.body.externalsecuritytaskId }).exec(function(err, externalSecurityTaskObject) {
                    if (externalSecurityTaskObject.isUpdated == false) {
                        if (err) {
                            //TODO: Implement logger
                            console.log(err)
                        } else {
                            req.assert('externalsecuritytask_hours', 'Please enter estimated hours').notEmpty();
                            req.assert('externalsecuritytask_cost', 'Please enter estimated cost').notEmpty();
                            var errors = req.validationErrors();
                            if (errors) {
                                return res.status(400).send(errors);
                            }
                            externalSecurityTaskObject.estimated_hours = req.body.externalsecuritytask_hours;
                            externalSecurityTaskObject.estimated_cost = req.body.externalsecuritytask_cost;
                            externalSecurityTaskObject.query = req.body.externalsecuritytask_query;
                            externalSecurityTaskObject.status = "ESTIMATION_COMPLETED";
                            externalSecurityTaskObject.isUpdated = true;
                            externalSecurityTaskObject.save(function(err) {
                                if (err) {
                                    //TODO: Implement logger
                                    console.log(err);
                                } else {
                                    callbackDone(null, externalSecurityTaskObject);
                                }
                            });
                        }
                    } else {
                        res.status(400).json("Already Submitted");
                    }
                });
            };

            var findUser = function(externalSecurityTaskObject, callBackUser) {
                UserModel.find({ company: externalSecurityTaskObject.company, role: configuration.roles.SECURITY_MANAGER }).exec(function(err, managers) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot list the Managers'
                        });
                    } else {
                        callBackUser(null, managers, externalSecurityTaskObject)
                    }
                });
            };

            async.waterfall([saveExternalTask, findUser], function(error, managers, externalSecurityTaskObject) {
                async.each(managers, function(manager, callback) {
                    var email = templates.managers(manager, externalSecurityTaskObject);
                    mail.mailService(email, manager.email);
                    callback();
                }, function(err) {
                    externalSecurityTaskObject.status = "FOR_APPROVAL";
                    externalSecurityTaskObject.save(function(err) {
                        if (err) {
                            //TODO: Implement logger
                            console.log(err);
                        } else {
                            res.send(externalSecurityTaskObject);
                        }
                    });
                });
            })
        },

        /**
         * Approve or Decline of task from security manager
         */

        approvedOrdeclinedTask: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');

            var saveSecurityTask = function(callbackSave) {
                ExternalSecurityTaskModel.findOne({ _id: req.body.externalsecuritytaskId }).exec(function(err, externalSecurityTaskObject) {
                    if (err) {
                        //TODO: implement logger
                        console.log(err);
                    } else {
                        externalSecurityTaskObject.status = req.body.externalsecuritytask_status;
                        externalSecurityTaskObject.isUpdated = true;
                        externalSecurityTaskObject.save(function(err, externalTaskSaveobj) {
                            if (err) {
                                //TODO: Implement Logger
                                console.log(err);
                            } else {
                                callbackSave(null, externalTaskSaveobj);
                            }
                        });
                    }
                });
            };
            
            var sendMail = function(externalTaskSaveobj, callbackApproved) {
                if (externalTaskSaveobj.status == 'APPROVED') {
                    var email = templates.external_user_approved(externalTaskSaveobj);
                    mail.mailService(email, externalTaskSaveobj.email);
                } else
                if (externalTaskSaveobj.status != 'COMPLETED' && externalTaskSaveobj.status != 'APPROVED') {
                    var email = templates.external_user_declined(externalTaskSaveobj);
                    mail.mailService(email, externalTaskSaveobj.email);
                }
                callbackApproved(null, externalTaskSaveobj);
            };

            async.waterfall([saveSecurityTask, sendMail, ], function(err, result) {
                if (err) {
                    //TODO: Implement Logger
                    console.log(err);
                } else {
                    var obj = result;
                    obj.actual_hours = req.body.externalsecuritytask_hours;
                    obj.actual_cost = req.body.externalsecuritytask_cost;
                    obj.save(function(err, finalObject) {
                        if (err) {
                            //TODO: implement Logger
                            console.log(err);
                        } else {
                        	 UserModel.find({ company: finalObject.company, role: configuration.roles.SECURITY_MANAGER }).exec(function(err, managers) {
                                 if (err) {
                                     return res.status(400).json({
                                         error: 'Cannot list the Managers'
                                     });
                                 } else {
                                	 async.each(managers, function(manager, callback) {
                                         var email = templates.manager_notify(manager, finalObject);
                                         mail.mailService(email, manager.email);
                                         callback();
                                     }, function(err) {
                                     });
                                 }
                             });
                            res.send(finalObject);
                        }
                    });
                }
            });
        },
        
        /**
         * Shows all the External Security task
         */
        all: function(req, res) {
        	 require('../models/external_securitytask')(req.companyDb);
             var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            
             ExternalSecurityTaskModel.find().exec(function(err, externalSecurityTasks) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the External Security Tasks'
                    });
                }
                res.json(externalSecurityTasks);
            });
        }
    };
}
