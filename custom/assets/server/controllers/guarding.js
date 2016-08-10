'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete & undo soft delete for Guarding>
 * @params: req.body & req.accessSystem       Contain new or updated details of Guarding
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    path = require('path'),
    mime = require('mime'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    fs = require('fs');
module.exports = function(Guarding) {
    return {
        /**
         * Find Building by id
         */
        building: function(req, res, next, id) {
            require('../../../building/server/models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.load(id, function(err, building) {
                if (err) {
                    return next(err);
                }
                if (!building) {
                    return next(new Error('Failed to load Building ' + id));
                }
                req.building = building;
                next();
            });
        },
        /**
         * Find Guarding by id
         */
        guarding: function(req, res, next, id) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            GuardingModel.load(id, function(err, guarding) {
                if (err) {
                    return next(err);
                }
                if (!guarding) {
                    return next(new Error('Failed to load Guarding ' + id));
                }
                req.guarding = guarding;
                next();
            });
        },
        /**
         * Create of Guarding
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding = new GuardingModel(req.body);
            req.assert('guarding_provider', 'Please enter guarding provider').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('duration', 'Please enter valid duration of service per month').matches('^[0-9]*$');
            req.assert('cost', 'Invalid Cost').matches('^[0-9]*$');
            req.assert('description', 'Please enter description for guarding service').notEmpty();
            req.assert('budget', 'Invalid Budget').matches('^[0-9]*$');
            req.assert('guarding_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('guarding_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('guarding_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('building_providers.name', 'Please enter external person name').notEmpty();
            req.assert('building_providers.email', 'Please enter external person email').isEmail();
            req.assert('building_providers.contact_number', 'Please enter external person contact number').notEmpty();
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            guarding.save(function(err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    res.json(guarding);
                }
            })
        },
        /**
         * Update a Guarding
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding = req.guarding;
            guarding = _.extend(guarding, req.body);
            req.assert('guarding_provider', 'Please enter guarding provider').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('duration', 'Please enter valid duration of service per month').matches('^[0-9]*$');
            req.assert('cost', 'Invalid Cost').matches('^[0-9]*$');
            req.assert('description', 'Please enter description for guarding service').notEmpty();
            req.assert('budget', 'Invalid Budget').matches('^[0-9]*$');
            req.assert('guarding_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('guarding_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('guarding_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('building_providers.name', 'Please enter external person name').notEmpty();
            req.assert('building_providers.email', 'Please enter external person email').isEmail();
            req.assert('building_providers.contact_number', 'Please enter external person contact number').notEmpty();
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            guarding.save(function(err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    res.json(guarding);
                }
            });
        },
        /**
         * Show a Guarding
         */
        show: function(req, res) {
            res.json(req.guarding);
        },
        /**
         * List of Guarding
         */
        all: function(req, res) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            GuardingModel.find({
                building: req.building._id
            }, function(err, guarding) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Guarding'
                    });
                }
                res.json(guarding);
            });
        },
        /**
         * Hard Delete the Guarding
         */
        destroy: function(req, res) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding = req.guarding;
            guarding.remove(function(err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the Guarding'
                    });
                }
                res.json(guarding);
            });
        },
        attachcontractguarding: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/guarding/", files.file[0].originalFilename, function(filepath) {
                        res.send(filepath);
                    });
                }
            });
        },
        attachbuildingmanualguarding: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/guarding/", files.file[0].originalFilename, function(filepath) {
                        res.send(filepath);
                    });
                }
            });
        }
    };
}