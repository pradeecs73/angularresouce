'use strict';
/**
 * Name : Audit Controller Description : In this controller Audits are created
 * by the super admin and Security Manager for a particular company. @ <author>
 * Sanjana @ <date> 11-July-2016 @ METHODS: create, get, update, soft delete
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('lodash');
var async = require('async');
var UserModel = mongoose.model('User');
var AuditCategoryModel = mongoose.model('AuditCategory');
var config = require('../../../../custom/actsec/server/config/config.js');

module.exports = function(AuditCtrl) {

    return {

        /**
         * load user buildings
         */
        userLocation: function(req, res) {
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            var locArray = req.user.locations;
            var locationArray = [];
            async.each(locArray, function(loc, callback) {
                LocationModel.findOne({
                    _id: loc
                }, function(err, location) {
                    locationArray.push(location);
                    callback();
                });
            }, function(err) {
                res.json(locationArray);
            });
        },

        /**
         * load user locations
         */

        userBuilding: function(req, res) {
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
                var buildingArray = [];
                var userBuildings = req.user.buildings;
                async.eachSeries(userBuildings, function(userBuilding, callback) {
                    async.eachSeries(buildings, function(building, callback) {
                        if (JSON.stringify(userBuilding) === JSON.stringify(building._id)) {
                            buildingArray.push(building);
                        }
                        callback();
                    });
                    callback();
                }, function(err) {
                    res.json(buildingArray);
                });
            });
        },

        /**
         * Loads the Audit based on id
         */
        audit: function(req, res, next, id) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            // require('../models/audit-category')(req.companyDb);

            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            AuditModel.load(id, function(err, audit) {
                req.auditObj = audit;
                audit = audit.toJSON();
                if (err) {
                    return next(err);
                }
                if (!audit) {
                    return next(new Error('Failed to load  Audit  ' + id));
                }
                LocationModel.findOne({
                    _id: audit.location
                }, function(err, location) {
                    audit.location = location;
                    BuildingModel.findOne({
                        _id: audit.building
                    }, function(err, building) {
                        audit.building = building;
                        UserModel.findOne({
                            _id: audit.security_manager
                        }, function(err, manager) {
                            audit.security_manager = manager;
                            AuditCategoryModel.findOne({
                                _id: audit.audit_category
                            }, function(err, auditCategory) {
                                audit.audit_category = auditCategory;
                                req.audit = audit;
                                next();
                            });
                        });
                    });
                });
            });
        },

        /**
         * load users for that building
         * */
        loadUsers: function(req, res) {
            UserModel.find({
                buildings: req.query.buildings
            }, function(err, users) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the users'
                    });
                }
                res.json(users);
            });
        },

        /**
         * Create a new Audit
         */
        create: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var auditArray = [];
            req.assert('name', 'You must enter Audit name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('location', 'You must select atleast one location').notEmpty();
            req.assert('building', 'You must select atleast one building').notEmpty();
            req.assert('security_manager', 'You must select one security_manager').notEmpty();

            var errors = [];
            var validationError = req.validationErrors()
            if (Array.isArray(validationError)) {
                errors = errors.concat(req.validationErrors());
            }
            if (!req.body.audit_category || req.body.audit_category.length == 0) {
                var errorObj = {
                    "param": "audit_category",
                    "msg": "You must select atleast one audit catergory"
                }
                errors.push(errorObj)
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            var auditCategories = req.body.audit_category;
            async.each(auditCategories, function(auditCategory, callback) {
                if (!auditCategory.auditCategoryid) {
                    var errorObj = {
                        "param": "audit_category.auditCategoryid",
                        "msg": "You must select atleast one audit catergory"
                    }
                    errors.push(errorObj)
                }
                if (!auditCategory.date) {
                    var errorObj = {
                        "param": "audit_category.date",
                        "msg": "You must enter date"
                    }
                    errors.push(errorObj)
                }
            })
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }

            async.each(auditCategories, function(auditCategory, callback) {
                var auditObj = {
                    "name": req.body.name,
                    "description": req.body.description,
                    "company": req.user.company,
                    "building": req.body.building,
                    "security_manager": req.body.security_manager,
                    "audit_category": auditCategory.auditCategoryid,
                    "createdBy": req.user.company,
                    "date": auditCategory.date,
                    "location": req.body.location
                }

                var audit = new AuditModel(auditObj);
                audit.save(function(err) {
                    if (err) {
                        callback(err);
                    }
                    auditArray.push(audit);
                    callback();
                });

            }, function(err) {
                if (err) {
                    return res.status(400);
                } else {
                    var resp = {
                        "auditArray": auditArray
                    }
                    res.json(resp);
                }
            });

        },

        /**
         * Shows all the Audits
         */
        all: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var overdueArray = [];
            var immediateArray = [];
            var day7Array = [];
            var day30Array = [];
            AuditModel.find({
                building: req.query.buildingId,
                isPerformed: false
            }).exec(function(err, audits) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Audits'
                    });
                }
                async.eachSeries(audits, function(audit, callback) {
                    AuditCategoryModel.findOne({
                        _id: audit.audit_category
                    }, function(err, auditCategory) {
                        if (auditCategory) {
                            delete audit.audit_category;
                            audit = audit.toObject();
                            audit.audit_category = auditCategory.toObject();
                            var date = audit.date;
                            var today = new Date();
                            var diff = Math.floor(date - today);
                            var day = 1000 * 60 * 60 * 24;
                            var days = Math.floor(diff / day);
                            if (days < -1) {
                                overdueArray.push(audit);
                            } else if (days >= -1 && days < 7) {
                                immediateArray.push(audit);
                            } else if (days <= 30 && days >= 7) {
                                day7Array.push(audit);
                            } else if (days > 30) {
                                day30Array.push(audit);
                            }
                            callback();
                        } else {
                            callback();
                        }
                    });
                }, function(err) {
                    var auditAll = {
                        "overdueArray": overdueArray,
                        "immediateArray": immediateArray,
                        "day7Array": day7Array,
                        "day30Array": day30Array
                    }
                    res.json(auditAll);
                });
            });
        },

        /**
         * Shows the single Audits
         */
        show: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            res.json(req.audit);
        },

        /**
         * Updates the edited Audit
         */
        update: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            req.body.updatedBy = req.user._id;
            var audit = req.auditObj
            audit = _.extend(audit, req.body);
            req.assert('name', 'You must enter Audit name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('audit_category', 'You must select atleast one audit catergory').notEmpty();
            req.assert('location', 'You must select atleast one location').notEmpty();
            req.assert('building', 'You must select atleast one building').notEmpty();
            req.assert('security_manager', 'You must select one security manager').notEmpty();
            req.assert('date', 'You must enter date').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            audit.save(function(err) {
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
                    res.json(audit);
            });
        },

        /**
         * Delete a Audit
         */
        destroy: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var audit = req.audit;
            audit.remove(function(err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the audit'
                    });
                }
                res.json(audit);
            });
        },
        /**
         * load security manager
         * */
        loadSecuritymanager: function(req, res) {
            UserModel.find({
                company: req.user.company,
                role: config.roles.SECURITY_MANAGER
            }, function(err, securityManagers) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the securityManagers'
                    });
                }
                res.json(securityManagers);
            });
        },
    }
};
