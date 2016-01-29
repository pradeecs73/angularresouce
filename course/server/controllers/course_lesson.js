'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');

var mongoose = require('mongoose'),
CoursematerialModel = mongoose.model('Coursematerial'),
_ = require('lodash');
module.exports = function (CourselessonCtrl) {
    return {
    	
    	 /**
         * Find Course chapter by id
         */
        coursechapter: function (req, res, next, id) {
        	CoursematerialModel.load(id, function (err, coursechapter) {
                if (err) {
                    return next(err);
                }
                if (!coursechapter) {
                    return next(new Error('Failed to load coursechapter ' + id));
                }
                req.coursechapter = coursechapter;
                next();
            });
        },
        /**
         * Find Course lesson by id
         */
    	courselesson: function (req, res, next, id) {
        	CoursematerialModel.load(id, function (err, courselesson) {
                if (err) {
                    return next(err);
                }
                if (!courselesson) {
                    return next(new Error('Failed to load courselesson ' + id));
                }
                req.courselesson = courselesson;
                next();
            });
        },
        /**
         * Create an course lesson
         */
        create: function (req, res) {
            var courselesson = new CoursematerialModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            courselesson.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(courselesson);
            });
        },
        /**
         * Update an course lesson
         */
        update: function (req, res) {
            var courselesson = req.courselesson;
            courselesson = _.extend(courselesson, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            courselesson.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(courselesson);
            });
        },
        /**
         * Delete a course lesson
         */
        destroy: function (req, res) {
            var courselesson = req.courselesson;
            courselesson.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the courselesson'
                    });
                }
                res.json(courselesson);
            });
        },

        /**
         * Show an course lesson
         */
        show: function (req, res) {
            res.json(req.courselesson);
        },

        /**
         * List of course lesson
         */
        all: function (req, res) {
        	CoursematerialModel.find().exec(function (err, courselessons) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courselessons'
                    });
                }
                res.json(courselessons);
            });
        },
    };

}