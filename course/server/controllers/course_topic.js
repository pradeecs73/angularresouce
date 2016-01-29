'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');

var mongoose = require('mongoose'),
CoursematerialModel = mongoose.model('Coursematerial'),
_ = require('lodash');
module.exports = function (CoursetopicCtrl) {
    return {
    	
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
         * Find Course topic by id
         */
    	coursetopic: function (req, res, next, id) {
        	CoursematerialModel.load(id, function (err, coursetopic) {
                if (err) {
                    return next(err);
                }
                if (!coursetopic) {
                    return next(new Error('Failed to load coursetopic ' + id));
                }
                req.coursetopic = coursetopic;
                next();
            });
        },
        /**
         * Create an course Topic
         */
        create: function (req, res) {
            var coursetopic = new CoursematerialModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursetopic.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursetopic);
            });
        },
        /**
         * Update an course topic
         */
        update: function (req, res) {
            var coursetopic = req.coursetopic;
            coursetopic = _.extend(coursetopic, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursetopic.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursetopic);
            });
        },
        /**
         * Delete a course topic
         */
        destroy: function (req, res) {
            var coursetopic = req.coursetopic;
            coursetopic.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the coursetopic'
                    });
                }
                res.json(coursetopic);
            });
        },

        /**
         * Show an course topic
         */
        show: function (req, res) {
            res.json(req.coursetopic);
        },

        /**
         * List of course topic
         */
        all: function (req, res) {
        	CoursematerialModel.find().exec(function (err, coursetopic) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the coursetopic'
                    });
                }
                res.json(coursetopic);
            });
        },
    };

}