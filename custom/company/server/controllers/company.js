'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete, Hard Delete for Company>
 * @params: {req.body}, {req.company}       Contain new or updated details of Company
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    CompanyModel = mongoose.model('Company'),
    async = require('async'),
    userController = require('../../../../contrib/meanio-users/server/controllers/users.js')(userController),
    UserModel = mongoose.model('User'),
    configuration = require('../../../../custom/actsec/server/config/config.js'),
    _ = require('lodash');
/**
 * Delete User if company creation is failed
 * @params: {user} contain user object
 */
var deleteUser = function(user) {
    var user = user;
    user.remove({
        _id: user._id
    }, function(err) {
        if (err) {
            return err
        }
    });
}
module.exports = function(Company) {
    return {
        /**
         * Find Company by id
         */
        company: function(req, res, next, id) {
            CompanyModel.load(id, function(err, company) {
                if (err) {
                    return next(err);
                }
                if (!company) {
                    return next(new Error('Failed to load company ' + id));
                }
                req.company = company;
                next();
            });
        },
        /**
         * Find company by token
         */
        loadbyToken: function(req, res, next, token) {
            CompanyModel.loadToken(token, function(err, company) {
                if (err) {
                    return next(err);
                }
                if (!company) {
                    return next(new Error('Failed to load company '));
                }
                req.companybyToken = company;
                next();
            });
        },
        /**
         * Create of Company
         */
        create: function(req, res) {
            var proceed = false
            req.body.createdBy = req.user._id;
            req.body.token = 'i' + new Date().getTime();
            var company = new CompanyModel(req.body);
            /**
             * check validations
             * @params: function, contain callback function
             */
            var validation = function(callbackValidation) {
                    req.assert('company_name', 'Please enter Company name').notEmpty();
                    req.assert('address_line_1', 'Please enter address').notEmpty();
                    req.assert('city', 'Please enter city').notEmpty();
                    req.assert('state', 'Please enter state').notEmpty();
                    req.assert('country', 'Please enter country').notEmpty();
                    req.assert('zipcode', 'Please enter zipcode').notEmpty();
                    req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]');
                    var errors = [];
                    var validationError = req.validationErrors()
                    if (Array.isArray(validationError)) {
                        errors = errors.concat(req.validationErrors());
                    }
                    if (!req.body.security_manager) {
                        var valError = {
                            param: 'security_manager',
                            msg: 'Please enter Security Manager Details'
                        };
                        errors.push(valError)
                    }
                    if (errors.length > 0) {
                        return res.status(400).send(errors);
                    }
                    var securityManager = req.body.security_manager;
                    var userObj = { //Creating user object with given fields & pass to user create function on user controller
                        firstname: securityManager.firstname,
                        lastname: securityManager.lastname,
                        email: securityManager.email,
                        company: company._id,
                        createdBy: req.user._id
                    }
                    callbackValidation(null, userObj);
                }
                //Get response after user creation
            var errorResponse = function(userCreateStatus, callbackError) {
                if (userCreateStatus.status == 400 || userCreateStatus.status == undefined) {
                    return res.status(400).send(userCreateStatus)
                } else
                if (userCreateStatus.status == 200) {
                    proceed = true
                    callbackError(null, userCreateStatus, proceed)
                }
            }
            async.waterfall([
                validation,
                userController.createManagers,
                errorResponse,
            ], function(error, userCreateStatus, proceed) {
                if (proceed == true) {
                    var ticks = new Date().getTime();
                    company.database = company.company_name.replace(/\W/g, '') + ticks;
                    company.database = company.database.substring(0, 18);
                    company.save(function(err) {
                        if (err) {
                            if (userCreateStatus) {
                                deleteUser(userCreateStatus.data); //Removing security manager from usertable if error occurs
                            }
                            switch (err.code) {
                                case 11000:
                                case 11001:
                                    res.status(400).json([{
                                        msg: ' Company already exists',
                                        param: 'company_name'
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
                        } else {
                            res.json(company);
                        }
                    });
                }
            })
        },
        /**
         * Update a Company
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            delete req.body._id;
            var company = req.company;
            company = _.extend(company, req.body);
            req.assert('company_name', 'Please enter Company Name').notEmpty();
            req.assert('address_line_1', 'Please enter address').notEmpty();
            req.assert('city', 'Please enter city').notEmpty();
            req.assert('state', 'Please enter state').notEmpty();
            req.assert('country', 'Please enter country').notEmpty();
            req.assert('zipcode', 'Please enter zipcode').notEmpty();
            req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]');
            req.assert('database', 'Database cannot be changed').equals(req.company.database);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            company.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Company already exists',
                                param: 'company_name'
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
                res.json(company);
            });
        },
        /**
         * Hard Delete the Company
         */
        destroy: function(req, res) {
            var company = req.company;
            //TODO: mongodb connection is hardcaded but can be changed later
            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
            var buildingIdArray = [];
            require('../../../location/server/models/location')(companyDb);
            var LocationModel = companyDb.model('Location');
            require('../../../building/server/models/building')(companyDb);
            var BuildingModel = companyDb.model('Building');
            require('../../../assets/server/models/accessControl')(companyDb);
            var AccessControlModel = companyDb.model('AccessControl');
            require('../../../assets/server/models/burglarAlarm')(companyDb);
            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
            require('../../../assets/server/models/cameraSystem')(companyDb);
            var CameraSyatemModel = companyDb.model('CameraSystem');
            require('../../../assets/server/models/guarding')(companyDb);
            var GuardingModel = companyDb.model('Guarding');
            var deleteLocation = function(callbackLocation) {
                LocationModel.find({
                    company: company._id
                }).exec(function(err, locations) {
                    async.each(locations, function(location, callback) {
                        location.remove(function(err) {
                            //TODO: have to add logger
                            if (err) {
                                console.log(err)
                            }
                        })
                        callback();
                    }, function(err) {})
                    callbackLocation();
                })
            }
            var deleteBuilding = function(callbackBuilding) {
                BuildingModel.find({
                    company: company._id
                }).exec(function(err, buildings) {
                    async.each(buildings, function(building, callback) {
                        buildingIdArray.push(building._id)
                        building.remove(function(err) {
                            //TODO: have to add logger
                            if (err) {
                                console.log(err)
                            }
                        })
                        callback();
                    }, function(err) {})
                    callbackBuilding(null, buildingIdArray)
                })
            }
            var deleteAssets = function(buildingIdArray, builcallbackAssets) {
                async.each(buildingIdArray, function(buildingId, callback) {
                    AccessControlModel.find({
                        building: buildingId
                    }).exec(function(err, accessControls) {
                        async.each(accessControls, function(accessControl, accessCallback) {
                            accessControl.remove(function(err) {
                                //TODO: have to add logger
                                if (err) {
                                    console.log(err)
                                }
                            })
                            accessCallback();
                        }, function(err) {
                            callback();
                        })
                    })
                    BurglarAlarmModel.find({
                        building: buildingId
                    }).exec(function(err, burglarAlarms) {
                        async.each(burglarAlarms, function(burglarAlarm, callback) {
                            burglarAlarm.remove(function(err) {
                                //TODO: have to add logger
                                if (err) {
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                    CameraSyatemModel.find({
                        building: buildingId
                    }).exec(function(err, cameraSyatemModels) {
                        async.each(cameraSyatemModels, function(cameraSyatemModel, callback) {
                            cameraSyatemModel.remove(function(err) {
                                //TODO: have to add logger
                                if (err) {
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                    GuardingModel.find({
                        building: buildingId
                    }).exec(function(err, guardingModels) {
                        async.each(guardingModels, function(guardingModel, callback) {
                            guardingModel.remove(function(err) {
                                //TODO: have to add logger
                                if (err) {
                                    console.log(err)
                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                })
                builcallbackAssets();
            }
            var deleteManagers = function(callbackManagers) {
                UserModel.find({
                    company: req.company._id
                }).exec(function(err, managers) {
                    async.each(managers, function(manager, callback) {
                        manager.remove(function(err) {
                            //TODO: have to add logger
                            if (err) {
                                console.log(err)
                            }
                        })
                    })
                })
                callbackManagers();
            }
            async.waterfall([
                deleteLocation,
                deleteBuilding,
                deleteAssets,
                deleteManagers,
            ], function(error) {
                company.remove(function(err) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot delete the Company'
                        });
                    }
                    res.json(company);
                });
            });
        },
        /**
         * Show a Company
         */
        show: function(req, res) {
            res.json(req.company);
        },
        /**
         * List of Companies
         */
        all: function(req, res) {
            CompanyModel.find().exec(function(err, company) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Company'
                    });
                }
                res.json(company);
            });
        },
        /**
         * Find all security Manager of company
         */
        manager: function(req, res) {
            UserModel.find({
                company: req.company._id,
                role: configuration.roles.SECURITY_MANAGER
            }).exec(function(err, managers) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Managers'
                    });
                }
                res.json(managers);
            });
        },
        /**
         * update Token 
         */
        updateToken: function(req, res) {
            req.companybyToken.token = 'i' + new Date().getTime();
            var company = req.companybyToken;
            company = _.extend(company, req.companybyToken);
            company.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Company already exists',
                                param: 'company_name'
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
                res.json(company);
            });
        },
        getLoggedUserCompany: function(req, res) {
            var ide = mongoose.Types.ObjectId(req.user.company._id);
            CompanyModel.findOne({
                _id: ide
            }).exec(function(err, company) {
                if (err) {
                    return res.status(400);
                } else {
                    res.json(company);
                }
            })
        },
        loadCompany: function(req, res) {
            res.json(req.companybyToken);
        }
    };
}