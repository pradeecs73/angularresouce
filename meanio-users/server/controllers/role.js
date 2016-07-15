'use strict';
/** Name : Role Controller
 * Description : This controller defines predefined roles created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 14-Jun-2016
 * @ METHODS: create, Update, get, delete
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    RoleModel = mongoose.model('Role'),
    FeatureModel = mongoose.model('Feature'),
    _ = require('lodash'),
    async = require('async');
var auth = require('../../authorization.js');
var configuration = require('../../../../custom/actsec/server/config/config.js');
module.exports = function(RoleCtrl) {
    return {
        /**
         * Loads the Role based on id
         */
        role: function(req, res, next, id) {
            RoleModel.load(id, function(err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.role = role;
                next();
            });
        },
        /**
         * Create the Role
         */
        create: function(req, res) {
            if (auth.companyAuthentication(req, req.user.company._id)) {
                var role = new RoleModel(req.body);
                role.company = req.user.company;
                if ((req.user.role._id + '') == configuration.roles.SUPER_ADMIN) {
                    role.pristine = true;
                }
                var features = req.body.feature;
                var dashboards = req.body.dashboard;
                var roleFeatures = [];
                var roleDashboards = [];
                role.save(function(err) {
                    if (err) {
                        switch (err.code) {
                            case 11000:
                            case 11001:
                                return res.status(400).json([{
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
                                    return res.status(400).json(modelErrors);
                                }
                                return res.status(400);
                        }
                    }
                    if (dashboards) {
                        for (var d = 0; d < dashboards.length; d++) {
                            roleDashboards.push(dashboards[d]._id);
                        }
                        role.dashboards = roleDashboards;
                    }
                    res.json(role);
                });
            } else {
                return res.status(403).send([{"permission":'Access denied'}]);
            }
        },
        /**
         * Update the Role
         */
        update: function(req, res) {
            if (auth.companyAuthentication(req, req.user.company._id)) {
                var role = req.role;
                role = _.extend(role, req.body);
                req.assert('name', 'You must enter role name').notEmpty();
                req.assert('description', 'You must enter role description').notEmpty();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                var features = req.body.feature;
                var dashboards = req.body.dashboard;
                var roleFeatures = [];
                var roleDashboards = [];
                role.save(function(err) {
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
                                    res.status(400).json(modelErrors);
                                }
                        }
                        return res.status(400);
                    }
                    if (dashboards) {
                        for (var d = 0; d < dashboards.length; d++) {
                            roleDashboards.push(dashboards[d]._id);
                        }
                        role.dashboards = roleDashboards;
                    }
                    res.json(role);
                });
            } else {
                return res.status(403).send([{"permission":'Access denied'}]);
            }
        },
        /**
         * Show the Role
         */
        show: function(req, res) {
            if (auth.companyAuthenticationRole(req, req.role.company)) {
                res.json(req.role);
            } else {
                return res.status(403).send([{"permission":'Access denied'}]);
            }
        },
        /**
         * List of Roles
         */
        all: function(req, res) {
            RoleModel.find({
                "company": (typeof req.user.company._id !== 'undefined') ? req.user.company._id : ''
            }).populate('feature', 'name').populate('dashboard', 'name').sort({
                name: 'asc'
            }).exec(function(err, roles) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the roles'
                    });
                } else {
                    RoleModel.find({
                        "pristine": true
                    }).populate('feature', 'name').populate('dashboard', 'name').sort({
                        name: 'asc'
                    }).exec(function(err, pristines) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot list the pristine roles'
                            });
                        }
                        var results = {};
                        results.pristine = pristines;
                        results.roles = roles;
                        return res.json(results);
                    });
                }
            });
        },
        /**
         * Delete the Role
         */
        destroy: function(req, res) {
            if (auth.companyAuthentication(req, req.role.company._id)) {
                var role = req.role;
                role.isActive = true;
                role.save(function(err) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot delete the role'
                        });
                    }
                    res.json(role);
                });
            } else {
                return res.status(403).send([{"permission":'Access denied'}]);
            }
        }
    }
};