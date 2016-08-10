'use strict';
/*
 * <Author: Abha Singh>
 * <Date:21-06-2016>
 * <Function: Create, Update, All, show, location,Delete for location>
 * @param: {req.body}, {req.location}
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('../../../actsec/server/config/config.js'),
    _ = require('lodash');

module.exports = function(Location) {

    return {

        /**
         * Find location by id
         */
        location: function(req, res, next, id) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            LocationModel.load(id, function(err, location) {
                if (err) {
                    return next(err);
                }
                if (!location) {
                    return next(new Error('Failed to load location ' + id));
                }
                req.location = location;
                next();
            });
        },

        /**
         * Create Location for company
         */
        create: function(req, res) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company;
            var location = new LocationModel(req.body);
            req.assert('name', 'You must enter a name').notEmpty();
            req.assert('address_line_1', 'You must enter a Address Line-1').notEmpty();
            req.assert('city', 'You must enter a city').notEmpty();
            req.assert('state', 'You must enter a state').notEmpty();
            req.assert('country', 'You must enter a country').notEmpty();
            req.assert('zip_code', 'You must enter a zip code').notEmpty();
            req.assert('contact_number', 'You must enter a Contact Number').notEmpty();
            req.assert('square_feet', 'Invalid square feet').matches('^[0-9]*$');
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            location.save(function(err) {
                if (err) {
                    switch (err.code) {
                        default: var modelErrors = [];
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
                } else
                    User.find({ company: req.user.company._id, role: config.roles.SECURITY_MANAGER }).exec(function(err, managers) {
                        async.each(managers, function(manager, callback) {
                            var locationArray = manager.locations
                            locationArray.push(location._id)
                            manager.update({ locations: locationArray }, function(err) {
                                //TODO: Have to implement logger
                                if (err) {
                                    console.log(err)
                                }
                            })
                        })
                    })
                res.json(location);
            });
        },
        /**
         * load all Location for company
         */
        all: function(req, res) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            LocationModel.find(function(err, locations) {
                if (err) {
                    res.send(err);
                } else
                    res.json(locations);
            });
        },

        /**
         * Update Location for company
         */
        update: function(req, res) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            req.body.updatedBy = req.user._id;
            var location = req.location;
            location = _.extend(location, req.body);
            req.assert('name', 'You must enter a name').notEmpty();
            req.assert('address_line_1', 'You must enter a address_line_1').notEmpty();
            req.assert('city', 'You must enter a city').notEmpty();
            req.assert('state', 'You must enter a state').notEmpty();
            req.assert('country', 'You must enter a country').notEmpty();
            req.assert('zip_code', 'You must enter a zip_code').notEmpty();
            req.assert('contact_number', 'You must enter a contact_number').notEmpty();
            req.assert('square_feet', 'Invalid square feet').matches('^[0-9]*$');
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            location.save(function(err) {
                if (err) {
                    switch (err.code) {
                        default: var modelErrors = [];
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
                } else
                    res.json(location);
            });
        },
        /**
         * Show an Location for a company
         */
        show: function(req, res) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            res.json(req.location);
        },

        /**
         * Hard delete location for company 
         */
        delete: function(req, res) {
            require('../models/location')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            require('../../../building/server/models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../assets/server/models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            require('../../../assets/server/models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            require('../../../assets/server/models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            require('../../../assets/server/models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');

            var location = req.location;
            var buildingIdArray = [];

            var deleteBuilding = function(callbackBuilding) {
                BuildingModel.find({location:location._id}).exec(function(err, buildings) {
                    async.each(buildings, function(building, callback){
                        buildingIdArray.push(building._id);
                        building.remove(function(err){
                            //TODO: have to add logger
                            if (err){
                                console.log(err)
                            }
                        })
                        callback();
                    }, function(err) {
                        callbackBuilding(null, buildingIdArray)
                    })
                })
            };

            var deleteAssets = function(buildingIdArray, builcallbackAssets) {
                async.each(buildingIdArray, function(buildingId, parentCallback){
                    AccessControlModel.find({building:buildingId}).exec(function(err, accessControls) {
                        async.each(accessControls, function(accessControl, accessCallback){
                            accessControl.remove(function(err){                                
                                //TODO: have to add logger
                                if (err){
                                    console.log(err)
                                }
                            })
                            accessCallback();
                        }, function(err) {

                        })
                    })

                    BurglarAlarmModel.find({building:buildingId}).exec(function(err, burglarAlarms) {
                        async.each(burglarAlarms, function(burglarAlarm, callback){
                            burglarAlarm.remove(function(err){
                                //TODO: have to add logger
                                if (err){
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {
                            
                        })
                    })

                    CameraSystemModel.find({building:buildingId}).exec(function(err, cameraSystems) {
                        async.each(cameraSystems, function(cameraSystem, callback){
                            cameraSystem.remove(function(err){
                                //TODO: have to add logger
                                if (err){
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {
                            
                        })
                    })

                    GuardingModel.find({building:buildingId}).exec(function(err, guardings) {
                        async.each(guardings, function(guarding, callback){
                            guarding.remove(function(err){
                                //TODO: have to add logger
                                if (err){
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {
                            
                        })
                    })
                    parentCallback();
                }, function(err){
                    builcallbackAssets(null, buildingIdArray);
                })
            };

            var deleteUser = function(buildingIdArray, deleteUserCallback){
                //Removing location Id from security managers user object
                User.find({ company: req.user.company._id }).exec(function(err, managers) {
                    async.each(managers, function(manager, managerCallback) {
                        var buildingArray = manager.buildings;
                        var locationCounter = 0;
                        var locationArray = manager.locations;
                        //Remove building from user db
                        async.each(buildingIdArray, function(buildingId, buildingCallback) {
                            var buildingCounter = 0;
                            async.each(manager.buildings, function(userBuilding, userBuildingCallback) {
                                if (JSON.stringify(buildingId) === JSON.stringify(userBuilding)) {
                                    buildingArray.splice(buildingCounter, 1);
                                }
                                buildingCounter = buildingCounter + 1
                                userBuildingCallback();
                            }, function(err) {
                                buildingCallback();
                            })
                        }, function(){
                            //Remove location from user db
                            async.each(locationArray, function(locationId, locationCallback) {
                                if (JSON.stringify(locationId) === JSON.stringify(location._id)) {
                                    locationArray.splice(locationCounter, 1);
                                }
                                locationCounter = locationCounter + 1
                                locationCallback();
                            }, function(err) {
                                manager.update({ locations: locationArray, buildings : buildingArray }, function(err) {
                                    //TODO: have to implement logger
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                                managerCallback();
                            });
                        })
                    }, function(err) {
                        deleteUserCallback();
                    });
                });
            };
            
            async.waterfall([
                deleteBuilding,
                deleteAssets,
                deleteUser
            ], function(error) {
                location.remove(function(err) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot delete the location'
                        });
                    }
                    res.json(location);
                });
            })
        },
    };
}
