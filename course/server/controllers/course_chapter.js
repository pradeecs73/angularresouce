'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');

var mongoose = require('mongoose'),
CoursematerialModel = mongoose.model('Coursematerial'),
_ = require('lodash');
module.exports = function (CoursechapterCtrl) {
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
         * Create an course chapter
         */
        create: function (req, res) {
            var coursechapter = new CoursematerialModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursechapter.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursechapter);
            });
        },
        /**
         * Update an course chapter
         */
        update: function (req, res) {
            var coursechapter = req.coursechapter;
            coursechapter = _.extend(coursechapter, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursechapter.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(coursechapter);
            });
        },
        /**
         * Delete a course chapter
         */
        destroy: function (req, res) {
            var coursechapter = req.coursechapter;
            coursechapter.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the coursechapter'
                    });
                }
                res.json(coursechapter);
            });
        },

        /**
         * Show an course chapter
         */
        show: function (req, res) {
            res.json(req.coursechapter);
        },

        /**
         * List of course chapter
         */
        all: function (req, res) {
        	CoursematerialModel.find().exec(function (err, coursechapters) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the coursechapters'
                    });
                }
                res.json(coursechapters);
            });
        },
    };

}