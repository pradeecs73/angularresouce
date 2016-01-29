'use strict';
/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');
require('../../../course/server/models/course.js');
var mongoose = require('mongoose'),
    CourseModel = mongoose.model('Course'),
    BatchModel = mongoose.model('Batch'),
    AttendanceModel = mongoose.model('Attendance'),
    async = require('async'),
    _ = require('lodash');
//This is the controller for batches
module.exports = function(Batch) {
    return {
        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
            CourseModel.load(id, function(err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
        },
        batch: function(req, res, next, id) {
            BatchModel.load(id, function(err, batch) {
                if (err) return next(err);
                if (!batch) return next(new Error('Failed to load batch ' + id));
                req.batch = batch;
                next();
            });
        },
        /**
         * Create an batch
         */
        create: function(req, res) {
            var batch = new BatchModel(req.body);
            req.assert('batch_name', 'Please enter  Name').notEmpty();
            req.assert('start_date', 'start_date should not be empty').notEmpty();
            req.assert('course', 'Please create a batch for list of available courses.').notEmpty();
            //req.assert('class_hour', 'You must enter class hour').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var errors = [];
            errors.concat(req.validationErrors());
            var d = new Date();
            var d1 = new Date(req.body.start_date);
            if (d1 < d) {
                var dateError = {
                    msg: "Start date should be greater than current date",
                    param: "start_date"
                };
                errors.push(dateError);
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            batch.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Name already exists',
                                param: 'name'
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
                                console.log('mod' + modelErrors);
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                res.json(batch);
            });
        },
        /**
         * Update an batch
         */
        update: function(req, res) {
            var batch = req.batch;
            batch = _.extend(batch, req.body);
            req.assert('batch_name', 'Please enter  Name').notEmpty();
            req.assert('start_date', 'start_date should not be empty').notEmpty();
            req.assert('course', 'courseId is not available').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var errors = [];
            errors.concat(req.validationErrors());
            var d = new Date();
            var d1 = new Date(req.body.start_date);
            if (d1 < d) {
                var dateError = {
                    msg: "Start date should be greater current date",
                    param: "start_date"
                };
                errors.push(dateError);
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            batch.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Name already exists',
                                param: 'name'
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
                                console.log('mod' + modelErrors);
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                res.json(batch);
            });
        },
        /**
         * Delete a batch
         */
        destroy: function(req, res) {
            var batch = req.batch;
            batch.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the batch'
                    });
                }
                res.json(batch);
            });
        },
        /**
         * Show an batch
         */
        show: function(req, res) {
            res.json(req.batch);
        },
        /**
         * List of batch
         */
        all: function(req, res) {
            BatchModel.find().exec(function(err, batches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the batch'
                    });
                }
                res.json(batches);
            });
        },
        /**
         * List of batch as by pagination
         */
        batchListByPagination: function(req, res) {
            var populateObj = {
                'branch': '',
                'course': ''
            };
            utility.pagination(req, res, BatchModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        saveattendance: function(req, res) {
            async.each(req.body.students, function(studentdetails) {
                var attendancdetaails = {};
                attendancdetaails.batch_id = req.body._id;
                attendancdetaails.date = req.body.date;
                attendancdetaails.student_id = studentdetails._id;
                attendancdetaails.attended = studentdetails.attended;
                var attendance = new AttendanceModel(attendancdetaails);
                attendance.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            res.send(200);
        },
        checkattendance: function(req, res) {
            var date = new Date(req.query.date);
            var batch_id = req.query.batch_id;
            AttendanceModel.find({
                batch_id: batch_id,
                date: new Date(date)
            }, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                }
            }).populate('student_id', 'name').populate('batch_id', 'batch_name');
        },
        updateattendace: function(req, res) {
            async.waterfall([
                function(done) {
                    async.each(req.body.attendance, function(studentdetails,callback) {
                        var date = new Date(req.body.date);
                        var attendancdetaails = {};
                        AttendanceModel.findOne({date:new Date(date),student_id:studentdetails.student_id._id},function(err,attendanceupdatingobject){
                                  attendanceupdatingobject.attended=studentdetails.attended;
                                  attendanceupdatingobject.save(function(err){
                                       if (err){
                                               console.log(err);
                                              }
                                  });   
                        });
                      callback();
                    });
                    done();
                },
                function(done) {
                    done();
                }
            ], function(err) {
                res.send(200);
            });
        }
    };
}