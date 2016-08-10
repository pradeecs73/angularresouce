'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Hard Delete for Training>
 * @params: {req.body}, {req.training}       Contain new or updated details of Training
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash');
var UserModel = mongoose.model('User');
module.exports = function(Training) {

    return {
        /**
         * Find Training by id
         */

        training: function(req, res, next, id) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            TrainingModel.load(id, function(err, training) {
                if (err) {
                    return next(err);
                }
                if (!training) {
                    return next(new Error('Failed to load training ' + id));
                }
                req.training = training;
                next();
            });
        },

        /**
         * Create of Training
         */
        create: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company._id;
            var training = new TrainingModel(req.body);
            req.assert('training_name', 'Please enter Training name').notEmpty();
            req.assert('shortName', 'Please enter short name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            training.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Training already exists',
                                param: 'training_name'
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
                res.json(training);
            });
        },

        /**
         * Update a Training
         */

        update: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            req.body.updatedBy = req.user._id;
            var training = req.training;
            training = _.extend(training, req.body);
            req.assert('training_name', 'Please enter Training name').notEmpty();
            req.assert('shortName', 'Please enter short name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            training.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Training already exists',
                                param: 'training_name'
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
                res.json(training);
            })
        },

        /**
         * Show a Training
         */
        show: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            res.json(req.training);
        },

        /**
         * List of Trainings
         */
        all: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            TrainingModel.find(function(err, training) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the training'
                    });
                }
                res.json(training);
            });
        },

        /**
         * Hard Delete the Training
         */
        destroy: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            var training = req.training;
            UserModel.find({
                trainings: req.training._id
            }, function(err, users) {
                if (err) {
                    res.status(500);
                }
                async.eachSeries(users, function(user, callback) {
                    user.trainings = user.trainings.filter(function(item) {
                        return JSON.stringify(item) !== JSON.stringify(req.training._id);
                    });
                    user.save(function(err) {
                        if (err) {
                            return res.status(400).json({
                                error: 'Cannot Save the User'
                            });
                        } else {
                            callback();
                        }
                    });

                }, function(err) {
                    training.remove(function(err) {
                        if (err) {
                            return res.status(400).json({
                                error: 'Cannot delete the Training'
                            });
                        }
                        res.json(training);
                    });
                });
            });
        },

        allUser: function(req, res) {
            UserModel.find({
                company: req.user.company._id
            }, function(err, users) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.status(200).json(users);
                }
            });
        },
    };
}
