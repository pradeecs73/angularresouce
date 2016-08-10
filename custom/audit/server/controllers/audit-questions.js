'use strict';
/** Name : Audit Question Controller
 * Description : In this controller Audit questions are created by the super admin and Security Manager.
 * @ <author> Anto Steffi 
 * @ <date> 24-June-2016 - 27-June-2016
 * @ METHODS: create, get, update, soft delete
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('lodash');

module.exports = function(AuditQuestionCtrl) {

    return {
        /**
         * Loads the Audit Questions based on id
         */
        auditQuestion: function(req, res, next, id) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            AuditQuestionModel.load(id, function(err, auditQuestion) {
                if (err) {
                    return next(err);
                }
                if (!auditQuestion) {
                    return next(new Error('Failed to load  Audit Question ' + id));
                }
                req.auditQuestion = auditQuestion;
                next();
            });
        },

        /**
         * Create a new Audit Question
         */
        create: function(req, res) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            req.body.createdBy = req.user._id;
            var auditQuestion = new AuditQuestionModel(req.body);
            req.assert('audit_question', 'You must enter Audit Question').notEmpty();
            req.assert('sequenceNo', 'You must enter sequenceNo').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            auditQuestion.save(function(err) {
                if (err) {
                	switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([{
							msg: ' Sequence Number already exists',
							param: 'sequenceNo'
						}]);
						break;
					default:
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
                	}
                    return res.status(400);
                }
                res.json(auditQuestion);
            });
        },

        /**
         * Shows all the Audit Questions
         */
        all: function(req, res) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            
            AuditQuestionModel.find().exec(function(err, auditQuestions) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Audit Questions'
                    });
                }
                res.json(auditQuestions);
            });
        },

        /**
         * Shows the single Audit Question
         */
        show: function(req, res) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            res.json(req.auditQuestion);
        },

        /**
         * Updates the edited Audit Question
         */
        update: function(req, res) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            req.body.updatedBy = req.user._id;
            var auditQuestion = req.auditQuestion;
            auditQuestion = _.extend(auditQuestion, req.body);
            req.assert('audit_question', 'You must enter Audit Question').notEmpty();
            req.assert('sequenceNo', 'You must enter sequenceNo').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            auditQuestion.save(function(err) {
            	if (err) {
                	switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([{
							msg: ' Sequence Number already exists',
							param: 'sequenceNo'
						}]);
						break;
					default:
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
                	}
                    return res.status(400);
                }
                res.json(auditQuestion);
            });
        },

        /**
         * Delete a Audit Question
         */
        destroy: function(req, res) {
            require('../models/audit-questions')(req.companyDb);
            var AuditQuestionModel = req.companyDb.model('AuditQuestion');
            var auditQuestion = req.auditQuestion;
            if (auditQuestion.isActive == true) {
                auditQuestion.isActive = false;
                auditQuestion.save(function(err) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot delete the Audit Question'
                        });
                    }
                    res.json(auditQuestion);
                });
            } else {
                return res.status(400).json({
                    error: 'Cannot delete the Audit Question'
                });
            }
        }
    }
};