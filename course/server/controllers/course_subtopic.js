'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');

var mongoose = require('mongoose'),
CoursematerialModel = mongoose.model('Coursematerial'),
_ = require('lodash');
module.exports = function (CoursesubtopicCtrl) {
    return {
    	
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
         * Find Course Subtopic by id
         */
    	coursesubtopic: function (req, res, next, id) {
        	CoursematerialModel.load(id, function (err, coursesubtopic) {
                if (err) {
                    return next(err);
                }
                if (!coursesubtopic) {
                    return next(new Error('Failed to load coursesubtopic ' + id));
                }
                req.coursesubtopic = coursesubtopic;
                next();
            });
        },
        /**
         * Create an course Subtopic
         */
        create: function (req, res) {
            var coursesubtopic = new CoursematerialModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursesubtopic.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursesubtopic);
            });
        },
        /**
         * Update an course subtopic
         */
        update: function (req, res) {
            var coursesubtopic = req.coursesubtopic;
            coursesubtopic = _.extend(coursesubtopic, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursesubtopic.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursesubtopic);
            });
        },
        /**
         * Delete a course subtopic
         */
        destroy: function (req, res) {
            var coursesubtopic = req.coursesubtopic;
            coursesubtopic.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the coursesubtopic'
                    });
                }
                res.json(coursesubtopic);
            });
        },

        /**
         * Show an course subtopic
         */
        show: function (req, res) {
            res.json(req.coursesubtopic);
        },

        /**
         * List of course subtopic
         */
        all: function (req, res) {
        	CoursematerialModel.find().exec(function (err, coursesubtopic) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the coursesubtopic'
                    });
                }
                res.json(coursesubtopic);
            });
        },
    };

}