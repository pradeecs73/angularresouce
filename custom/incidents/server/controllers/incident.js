'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    configuration = require('../../../actsec/server/config/config.js'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    multiparty = require('multiparty'),
    fs = require('fs'),
    async = require('async'),
    _ = require('lodash');
var path = require('path');
var mime = require('mime');
module.exports = function(Incidents) {
    return {
        attachIncidentPhoto: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.query.companyName, "/incidentsUpload/", files.file[0].originalFilename, function(filepath) {
                        res.send(filepath);
                    });
                }
            });
        },
        companyLocationAndBuilding: function(req, res) {
            var buildingArray = [],
                locationArray = [],
                array = [],
                uniqueLocation = [],
                companyBuildings = [];
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            BuildingModel.find({
                company: req.params.companyId
            }).exec(function(err, buildings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot fetch roles'
                    });
                }
                async.eachSeries(buildings, function(building, callback) {
                    BuildingModel.findOne({
                        _id: building
                    }, function(err, buildingObj) {
                        if (err) {
                            res.status(400).send(err);
                            callback();
                        } else {
                            buildingArray.push(buildingObj);
                            LocationModel.findOne({
                                _id: buildingObj.location
                            }, function(err, locationObj) {
                                if (err) {
                                    res.status(400).send(err);
                                    callback();
                                } else {
                                    locationArray.push(locationObj);
                                }
                                callback();
                            });
                        }
                    })
                }, function(err) {
                    //removing duplicates from array
                    uniqueLocation = _.map(_.groupBy(locationArray, function(obj) {
                        return obj._id;
                    }), function(grouped) {
                        return (grouped[0])
                    });
                    var counter = 0;
                    async.each(uniqueLocation, function(location, locationCallback) {
                        location = location.toJSON();
                        location.buildings = [];
                        async.each(buildingArray, function(building, buildingCallback) {
                            if (JSON.stringify(building.location) == JSON.stringify(location._id)) {
                                location.buildings.push(building);
                            }
                            buildingCallback();
                        }, function(err) {
                            array.push(location)
                            locationCallback();
                        })
                    }, function(err) {
                        res.json(array);
                    })
                });
            });
        },
        buildingsonLocation: function(req, res) {
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.find({
                location: req.query.locationId
            }, function(err, buildings) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the buildings'
                    });
                }
                res.json(buildings);
            });
        },
        create: function(req, res) {
            require('../models/incident')(req.companyDb);
            var IncidentModel = req.companyDb.model('Incident');
            require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            require('../../../../custom/securitytasks/server/models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            req.assert('name', 'You must enter risk name').notEmpty();
            req.assert('description', 'You must enter risk description').notEmpty();
            req.assert('building', 'You must enter building').notEmpty();
            req.assert('location', 'You must enter location').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            } else {
                var securitytask = {};
                securitytask.task_name = req.body.name;
                securitytask.description = req.body.description;
                securitytask.building = req.body.building;
                securitytask.location = req.body.location;
                securitytask.company = req.body.company;
                securitytask.cost = 1;
                securitytask.deadline = new Date();
                securitytask.source = 'INCIDENT';
                var securitytasks = new SecurityTaskModel(securitytask);
                securitytasks.save(function(err) {
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
                        req.body.securitytask = securitytasks._id;
                        var subtask = {};
                        subtask.name = req.body.name;
                        subtask.description = req.body.description;
                        subtask.company = req.body.company;
                        subtask.security_task = req.body.securitytask;
                        subtask.building = req.body.building;
                        var subtasks = new SubTaskModel(subtask);
                        subtasks.save(function(err) {
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
                            }
                            var incident = new IncidentModel(req.body);
                            incident.save(function(err) {
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
                                    require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
                                    var SecurityTaskModel = req.companyDb.model('SecurityTask');
                                    SecurityTaskModel.findOne({
                                        _id: securitytasks._id
                                    }, function(err, securitytaskObj) {
                                        if (err) {
                                            res.status(400).send(err);
                                        } else {
                                            var securityTask = securitytaskObj;
                                            var sectsknew = securitytaskObj;
                                            sectsknew.sourceId = incident._id;
                                            securityTask = _.extend(securityTask, sectsknew);
                                            securityTask.save(function(err) {
                                                if (err) {
                                                    return res.status(500).send(err);
                                                }
                                            })
                                        }
                                    });
                                    res.json(incident);
                                }
                            });
                        });
                    }
                });
            }
        },
        all: function(req, res) {
            require('../models/incident')(req.companyDb);
            var IncidentModel = req.companyDb.model('Incident');
            IncidentModel.find({}).sort({
                createdAt: -1
            }).populate('securitytask').exec(function(err, incidents) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the incidents'
                    });
                }
                var securityTaskArray = [];
                async.each(incidents, function(incident, callback) {
                    require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
                    var SecurityTaskModel = req.companyDb.model('SecurityTask');
                    SecurityTaskModel.findOne({
                        sourceId: incident._id
                    }, function(err, securitytask) {
                        if (err) {
                            res.status(400).send(err);
                            callback();
                        } else {
                            var securityTaskobj = securitytask;
                            incident = incident.toObject();
                            incident.securitytask = securityTaskobj;
                            securityTaskArray.push(incident);
                            callback();
                        }
                    });
                }, function(err) {
                    if (err) {
                        return res.status(400);
                    } else {
                        res.json(securityTaskArray);
                    }
                });
            });
        },
    };
}