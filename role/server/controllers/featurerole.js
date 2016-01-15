'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
     RoleModel = mongoose.model('Role'),
     FeatureroleModel = mongoose.model('Featurerole'),
    UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (FeatureroleCtrl) {

    return {
        /**
         * Find Role by id
         */

        featurerole: function (req, res, next, id) {
        	FeatureroleModel.load(id, function (err, featurerole) {
                if (err) {
                    return next(err);
                }
                if (!featurerole) {
                 return next(new Error('Failed to load featurerole ' + id));
                 }
                req.featurerole = featurerole;
                next();
            });
        },
        role: function (req, res, next, id) {
            RoleModel.load(id, function (err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load featurerole ' + id));
                 }
                req.role = role;
                next();
            });
        },
        
        user: function (req, res, next, id) {
            UserModel.load(id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return next(new Error('Failed to load user ' + id));
                 }
                req.user = user;
                next();
            });
        },
        
        useronRoles: function (req, res) {
        	FeatureroleModel.loadfeatureRoleByRoles(req.user.role, function (err, featureroles) {
                    if (err) {
                        return next(err);
                    }
                    if (!featureroles) {
                     return next(new Error('Failed to load featurerole ' + id));
                     }                
                    res.json(featureroles);
                });
        	
         },
       
        featurerolebyRole: function (req, res) {
            FeatureroleModel.loadfeatureRoleByRole(req.role._id, function (err, featureroles) {
                if (err) {
                    return next(err);
                }
                if (!featureroles) {
                 return next(new Error('Failed to load featurerole ' + id));
                 }                
                res.json(featureroles);
            });
        },


        create: function (req, res) {
            var featurerole = new FeatureroleModel(req.body);
                //userPage.user = req.user;
                //req.assert('feature', 'You must enter a featurerole name').notEmpty();
               /* req.assert('iswrite', 'You must enter is write ').notEmpty();
                req.assert('isdelete', 'You must enter is delete ').notEmpty();
                req.assert('isread', 'You must enter is read ').notEmpty();*/
                var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    }
                    featurerole.save(function (err) {
                        if (err) {
                            // return res.status(400).json({
                                // error: 'Cannot save the role'
                            // });
                        switch (err.code) {
                            case 11000:
                            case 11001:
                            res.status(400).json([{
                                msg: 'Featurerole already taken',
                                param: 'featureroleName'
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
                        FeatureroleCtrl.events.publish('create', {
                            //description: req.user.name + ' created ' + req.body.title + ' userPage.'
                        });
                    }
                        res.json(featurerole);
                });
            },


        /** Update the Role
         */
        update: function (req, res) {
            var featurerole = req.featurerole;
            var featurerole = _.extend(featurerole, req.body);

             /* req.assert('name', 'You must enter a featurerole name').notEmpty();
                req.assert('iswrite', 'You must enter is write ').notEmpty();
                req.assert('isdelete', 'You must enter is delete ').notEmpty();
                req.assert('isread', 'You must enter is read ').notEmpty();*/
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
             featurerole.save(function (err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                 ERRORS.ERROR_001
                             ]);
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
                        FeatureroleCtrl.events.publish('create', {
                        });
                    }
                        res.json(featurerole);
                });
            },


        /**
         * Delete the featurerole
         */
        destroy: function (req, res) {
            var featurerole = req.featurerole;


            featurerole.remove(function (err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the featurerole'
                    });
                }

                FeatureroleCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(featurerole);
            });
        },

        /**
         * Show the Role
         */
        show: function (req, res) {

            /*  role.events.publish('view', {
             description: req.user.name + ' read ' + req.role.title + ' role.'
             });
             */
            res.json(req.featurerole);
        },
        /**
         * List of Roles
         */
        all: function (req, res) {

            FeatureroleModel.find().populate('feature', 'name url isComponent icon color width').exec(function (err, featureroles) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the featureroles'
                    });
                }

                res.json(featureroles);
            });
        }
    };
}
