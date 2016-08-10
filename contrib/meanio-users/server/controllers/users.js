'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Feature = mongoose.model('Feature'),
    Role = mongoose.model('Role'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../../../../custom/actsec/server/config/user_template.js'),
    randtoken = require('rand-token'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    _ = require('lodash'),
    mail = require('../../../meanio-system/server/services/mailService.js'),
    upload = require('../../../meanio-system/server/services/bulkUpload.js'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken
var auth = require('../../authorization.js');
var XLSX = require('xlsx');
var filein = ('/NewFile.xlsx');
var configuration = require('../../../../custom/actsec/server/config/config.js');
var bulkUsers = {};
var path = require('path');
var mime = require('mime');
var fs = require('fs');
bulkUsers.result = [];
/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
};
var validateUserObj = function(userObj, callbackUO) {
    userObj.errors = [];
    userObj.warnings = [];
    async.waterfall([
        async.apply(validateName, userObj),
        validateEmail,
        validateRole,
        validateLocation,
    ], function(err) {
        if (userObj) {
            delete userObj.companyDB;
            bulkUsers.result.push(userObj);
            callbackUO();
        }
    });
};
var validateName = function(userObj, callbackName) {
    if (userObj.firstname && userObj.lastname) {
        if (((userObj.firstname).trim().length > 0) && (userObj.lastname).trim().length > 0) {
            callbackName(null, userObj);
        } else {
            userObj.errors.push('first and last name required.');
            callbackName(null, userObj);
        }
    } else {
        userObj.errors.push('first and last name required.');
        callbackName(null, userObj);
    }
};
var validateEmail = function(userObj, callbackEmail) {
    if (userObj.email) {
        if ((userObj.email).trim().length > 0) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailvalid = re.test(userObj.email);
            if (emailvalid) {
                User.findOne({
                    email: userObj.email
                }).exec(function(err, user) {
                    if (err) {
                        userObj.errors.push('Email is not valid.');
                        callbackEmail(null, userObj);
                    }
                    if (!user) {
                        callbackEmail(null, userObj);
                    }
                    if (user) {
                        userObj.errors.push('Email already exists.');
                        callbackEmail(null, userObj);
                    }
                });
            } else {
                userObj.errors.push('Email should be valid.');
                callbackEmail(null, userObj);
            }
        } else {
            userObj.errors.push('Email cannot be blank.');
            callbackEmail(null, userObj);
        }
    } else {
        userObj.errors.push('Email cannot be blank.');
        callbackEmail(null, userObj);
    }
};
var validateRole = function(userObj, callbackRole) {
    if (userObj.role) {
        if ((userObj.role).trim().length > 0) {
            var roleName = new RegExp('^' + userObj.role + '$', "i");
            Role.findOne({
                name: roleName
            }).exec(function(err, role) {
                if (err) {
                    userObj.errors.push('Role not found.');
                    callbackEmail(null, userObj);
                }
                if (role) {
                    if (configuration.roles.SUPER_ADMIN == role._id + '') {
                        userObj.errors.push('Role not found.');
                        callbackRole(null, userObj);
                    } else {
                        userObj.role = role._id;
                        callbackRole(null, userObj);
                    }
                } else {
                    userObj.errors.push('Role not found.');
                    callbackRole(null, userObj);
                }
            });
        } else {
            userObj.warnings.push('Employee role has been added.');
            userObj.role = configuration.roles.EMPLOYEE;
            callbackRole(null, userObj);
        }
    } else {
        userObj.warnings.push('Employee role has been added.');
        userObj.role = configuration.roles.EMPLOYEE;
        callbackRole(null, userObj);
    }
};
var validateLocation = function(userObj, callbackLocation) {
    if (userObj.userBuildings) {
        if ((userObj.userBuildings).trim().length > 0) {
            var strBuildings = userObj.userBuildings;
            strBuildings = strBuildings.split(',');
            require('../../../../custom/building/server/models/building')(userObj.companyDB);
            var BuildingModel = userObj.companyDB.model('Building');
            async.each(strBuildings, function(userBuilding, callbackuserBuilding) {
                var searchBuilding = userBuilding.trim();
                searchBuilding = new RegExp('^' + searchBuilding + '$', "i");
                BuildingModel.findOne({
                    building_name: searchBuilding
                }).exec(function(err, building) {
                    if (err) {
                        userObj.errors.push(userBuilding + ' building not found.');
                        callbackuserBuilding();
                    } else if (!building) {
                        userObj.errors.push(userBuilding + ' building not found.');
                        callbackuserBuilding();
                    } else {
                        userObj.buildings.push(building._id);
                        userObj.locations.push(building.location);
                        callbackuserBuilding();
                    }
                });
            }, function(err) {
                if (err) {
                    userObj.errors.push('Location not found.');
                    callbackLocation(null, userObj);
                } else {
                    callbackLocation(null, userObj);
                }
            });
        } else {
            userObj.errors.push('No builidngs has been added.');
            callbackLocation(null, userObj);
        }
    } else {
        userObj.errors.push('No builidngs has been added.');
        callbackLocation(null, userObj);
    }
};
module.exports = function(MeanUser) {
    return {
        /**
         * Auth callback
         */
        authCallback: function(req, res) {
            var payload = req.user;
            var escaped = JSON.stringify(payload);
            escaped = encodeURI(escaped);
            // We are sending the payload inside the token
            var token = jwt.sign(escaped, config.secret);
            res.cookie('token', token);
            var destination = config.strategies.landingPage;
            if (!req.cookies.redirect) {
                res.cookie('redirect', destination);
            }
            res.redirect(destination);
        },
        /**
         * Show login form
         */
        signin: function(req, res) {
            if (req.isAuthenticated()) {
                return res.redirect('/');
            }
            res.redirect('/login');
        },
        /**
         * Logout
         */
        signout: function(req, res) {
            MeanUser.events.publish({
                action: 'logged_out',
            });
            req.logout();
            res.redirect('/login');
        },
        /**
         * Session
         */
        session: function(req, res) {
            res.redirect('/');
        },
        /*Bulk upload Function*/
        bulkUploadUsers: function(req, res) {
            bulkUsers.result = [];
            var result = {};
            var workbook = {};
            result.users = [];
            var validSheet = [];
            var error = []
            var roa = {};
            /* waterfall starts*/
            async.waterfall([
                function(done) {
                    var form = new multiparty.Form();
                    form.parse(req, function(err, fields, files) {
                        if (files.file[0].originalFilename.split('.').pop() !== 'xls' && files.file[0].originalFilename.split('.').pop() !== 'xlsx') {
                            return res.status(400).json({
                                'Error': 'File Format Not Supported.'
                            });
                        } else {
                            upload.uploadFile(files, req.user.company.database, "/userbulkupload/", files.file[0].originalFilename, function(filepath) {
                                //TODO: Improve this logic. Currently it is checking if the filepath is numeric (numeric = error) else, it is accepted. Check bulkUpload.js
                                if (filepath === parseInt(filepath, 10)) {
                                    return res.status(400).json({
                                        'Error': 'File Format Not Supported.'
                                    });
                                } else {
                                    var workbook = XLSX.readFile(filepath);
                                    var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
                                    if (roa.length > 0) {
                                        var keysArray = Object.keys(roa[0]);
                                        if (keysArray[0] == 'firstname' && keysArray[1] == 'lastname' && keysArray[2] == 'email' && keysArray[3] == 'role' && keysArray[4] == 'userBuildings') {
                                            result.users = roa;
                                            done(null, result)
                                        } else {
                                            done('Missing fields or file format is incorrect.');
                                        }
                                    } else {
                                        done('Empty File.');
                                    }
                                }
                            });
                        }
                    });
                },
                function(result, done) {
                    async.each(result.users, function(user, callbackAsync) {
                        user.companyDB = req.companyDb;
                        user.company = req.user.company._id;
                        user.locations = [];
                        user.buildings = [];
                        validateUserObj(user, callbackAsync);
                    }, function(err) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Error while validating. ' + err
                            });
                        } else {
                            done(null, bulkUsers);
                        }
                    });
                },
                function(userBulk, done) {
                    async.each(userBulk.result, function(successObj, callbackSuccess) {
                        if (successObj.errors.length <= 0) {
                            var user = new User(successObj);
                            var token = randtoken.generate(8);
                            user.password = token;
                            user.save(function(err, user) {
                                if (err) {
                                    successObj.errors.push(err);
                                    callbackSuccess();
                                } else {
                                    var email = templates.userCredentialtemplate(successObj, token)
                                    mail.mailService(email, user.email)
                                    callbackSuccess();
                                }
                            });
                        } else {
                            callbackSuccess();
                        }
                    }, function(err) {
                        if (error.length > 0) {
                            userBulk.errors.push(err);
                            done(null, userBulk);
                        } else {
                            done(null, userBulk);
                        }
                    });
                }
            ], function(err, result) {
                if (err) {
                    return res.status(400).json({
                        error: 'Error while creating users: ' + err
                    });
                } else {
                    return res.json(result);
                }
            });
        },
        /**
         * Create user
         */
        create: function(req, res, next) {
            var user = new User(req.body);
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter a name').notEmpty();
            req.assert('email', 'You must enter a valid email address').isEmail();
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'email already taken',
                                param: 'email'
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
                var payload = user;
                payload.redirect = req.body.redirect;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    MeanUser.events.publish({
                        action: 'created',
                        user: {
                            name: req.user.name,
                            username: user.username,
                            email: user.email
                        }
                    });
                    // We are sending the payload inside the token
                    var token = jwt.sign(escaped, config.secret);
                    res.json({
                        token: token,
                        redirect: config.strategies.landingPage
                    });
                });
                res.status(200);
            });
        },
        loggedin: function(req, res) {
            if (!req.isAuthenticated()) return res.send('0');
            User.findById(req.user._id).populate('role').exec(function(err, user) {
                if (err) return next(err);
                res.send(user ? user : '0');
            })
        },
        /**
         * Send User
         */
        me: function(req, res) {
            if (!req.user) return res.send(null);
            if (!req.refreshJWT) {
                return res.json(req.user);
            } else {
                var payload = req.user;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                var token = jwt.sign(escaped, config.secret);
                res.json({
                    token: token
                });
            }
        },
        /**
         * Find create user by id
         */
        createuser: function(req, res, next, id) {
            User.load(id, function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },
        /**
         * Find user by id
         */
        user: function(req, res, next, id) {
            User.findOne({
                _id: id
            }).populate('role').populate('company').exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },
        /**
         * Loads a user into the request
         */
        loadUser: function(req, res, next) {
            if (!req.isAuthenticated()) {
                return next();
            }
            req.refreshJWT = false;
            User.findOne({
                _id: req.user._id
            }).populate('role').populate('company').exec(function(err, user) {
                if (err || !user) {
                    delete req.user;
                } else {
                    var dbUser = user.toJSON();
                    var id = req.user._id;
                    delete dbUser._id;
                    delete req.user._id;
                    var eq = _.isEqual(dbUser, req.user);
                    if (!eq) {
                        req.refreshJWT = true;
                    }
                    req.user = user;
                }
                return next();
            });
        },
        /**
         * Resets the password
         */
        resetpassword: function(req, res, next) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
                req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                    MeanUser.events.publish({
                        action: 'reset_password',
                        user: {
                            name: user.name
                        }
                    });
                    var email = templates.password_reset_email(user);
                    mail.mailService(email, user.email);
                    return res.send({
                        user: user
                    });
                });
            });
        },
        /**
         * change password
         * */
        updatePassword: function(req, res, next) {
            var registerUser = req.user;
            if (registerUser.hashPassword(req.body.currentPassword) !== registerUser.hashed_password) {
                return res.status(400).json({
                    param: 'currentPassword',
                    msg: 'Current password not matched'
                });
            }
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            registerUser.password = req.body.password;
            registerUser.save(function(err) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                } else {
                    res.json(registerUser);
                }
            });
        },
        /**
         * Callback for forgot password link
         */
        forgotpassword: function(req, res, next) {
            async.waterfall([
                function(done) {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function(token, done) {
                    User.findOne({
                        email: req.body.text
                    }, function(err, user) {
                        if (err || !user) return done(true);
                        done(err, user, token);
                    });
                },
                function(user, token, done) {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    var email = templates.forgot_password_email(user, token);
                    mail.mailService(email, user.email);
                    done(null, user);
                }
            ], function(err, user) {
                var response = {
                    message: 'Mail successfully sent',
                    status: 'success'
                };
                if (err) {
                    response.message = 'User does not exist';
                    response.status = 'danger';
                }
                MeanUser.events.publish({
                    action: 'forgot_password',
                    user: {
                        name: req.body.text
                    }
                });
                res.json(response);
            });
        },
        /**
         * user created by security managers 
         */
        createUser: function(req, res) {
            if (auth.companyAuthentication(req, req.user.company._id)) {
                var user = new User(req.body);
                req.assert('firstname', 'You must enter a firstname').notEmpty();
                req.assert('lastname', 'You must enter a lastname').notEmpty();
                req.assert('email', 'You must enter a valid email address').isEmail();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                var location = [];
                var building = [];
                async.each(req.body.locationAndBuilding, function(locAndBuild, locationCallback) {
                    if (locAndBuild.parents.length == 1) {
                        location.push(locAndBuild.id)
                    } else
                    if (locAndBuild.children == 0) {
                        building.push(locAndBuild.id)
                    }
                    locationCallback()
                }, function(err) {
                    user.locations = location;
                    user.buildings = building;
                    user.company = req.user.company;
                    var token = randtoken.generate(8);
                    user.password = token;
                    user.save(function(err) {
                        if (err) {
                            switch (err.code) {
                                case 11000:
                                case 11001:
                                    res.status(400).json([{
                                        code: 10001,
                                        msg: 'email already exists',
                                        param: 'email'
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
                            var email = templates.userCredentialtemplate(user, token)
                            mail.mailService(email, user.email)
                            res.status(200).json(user);
                        }
                    });
                })
            } else {
                return res.status(403).send([{
                    "permission": 'Access denied'
                }]);
            }
        },
        /**
         * list of user created by security managers 
         */
        allUser: function(req, res) {
            User.find({
                company: req.user.company._id,
                _id: {
                    $ne: req.user._id
                }
            }).populate('company').populate('role').exec(function(err, users) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.status(200).json(users);
                }
            });
        },
        /**
         * update user created by security managers 
         */
        updateUser: function(req, res) {
            if (auth.companyAuthentication(req, req.body.company._id)) {
                req.assert('firstname', 'You must enter a firstname').notEmpty();
                req.assert('lastname', 'You must enter a lastname').notEmpty();
                req.assert('email', 'You must enter a valid email address').isEmail();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                var location = [];
                var building = [];
                var user = req.profile;
                user = _.extend(user, req.body);
                async.each(req.body.locationAndBuilding, function(locAndBuild, locationCallback) {
                    if (locAndBuild.parents.length == 1) {
                        location.push(locAndBuild.id)
                    } else
                    if (locAndBuild.children == 0) {
                        building.push(locAndBuild.id)
                    }
                    locationCallback()
                }, function(err) {
                    user.locations = location;
                    user.buildings = building;
                    user.save(function(err) {
                        if (err) {
                            switch (err.code) {
                                case 11000:
                                case 11001:
                                    res.status(400).json([{
                                        msg: 'email already taken',
                                        param: 'email'
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
                            res.json(user);
                        }
                    });
                })
            } else {
                return res.status(403).send([{
                    "permission": 'Access denied'
                }]);
            }
        },
        /**
         * show user created by security managers 
         */
        showUser: function(req, res) {
            if (auth.companyAuthentication(req, req.profile.company._id)) {
                res.json(req.profile);
            } else {
                return res.status(403).send([{
                    "permission": 'Access denied'
                }]);
            }
        },
        /**
         * delete user created by security managers 
         */
        deleteUser: function(req, res) {
            var user = req.profile;
            user.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete user'
                    });
                }
                res.json(user);
            });
        },
        /**
         * user created by security managers 
         */
        createManagers: function(userObj, callback) {
            var user = new User(userObj);
            var errors = [];
            var errObj
            if (userObj.firstname == undefined || userObj.firstname == '') {
                errObj = {
                    param: 'firstname',
                    msg: 'You must enter a firstname'
                }
                errors.push(errObj)
            }
            if (userObj.lastname == undefined || userObj.lastname == '') {
                errObj = {
                    param: 'lastname',
                    msg: 'You must enter a lastname'
                }
                errors.push(errObj)
            }
            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (userObj.email == undefined || userObj.email == '') {
                errObj = {
                    param: 'email',
                    msg: 'You must enter a email'
                }
                errors.push(errObj)
            } else {
                if (!pattern.test(userObj.email)) {
                    errObj = {
                        param: 'email',
                        msg: 'Please enter a valid email address'
                    }
                    errors.push(errObj)
                }
            }
            if (errors.length) {
                callback(null, errors);
            } else {
                user.role = configuration.roles.SECURITY_MANAGER;
                var token = randtoken.generate(10);
                user.password = token;
                user.confirmPassword = token;
                user.save(function(err) {
                    if (err) {
                        switch (err.code) {
                            case 11000:
                            case 11001:
                                errObj = {
                                    param: 'email',
                                    msg: 'email already taken'
                                }
                                callback(null, errObj)
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
                                    callback(null, modelErrors);
                                }
                        }
                    } else {
                        user.save(function(err) {
                            if (err) {}
                            var email = templates.userCredentialtemplate(user, token)
                            mail.mailService(email, user.email)
                            var Obj = {
                                status: 200,
                                data: user
                            }
                            callback(null, Obj)
                        });
                    }
                });
            }
        },
        buildingBasedOnLocation: function(req, res) {
            var array = [];
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            async.eachSeries(req.user.locations, function(location, callback) {
                LocationModel.findOne({
                    _id: location
                }, function(err, locationObj) {
                    if (err) {
                        res.status(400).send(err);
                        callback();
                    } else {
                        BuildingModel.find({
                            location: location
                        }, function(err, buildingarray) {
                            if (err) {
                                res.status(400).send(err);
                                callback();
                            } else {
                                array.push({
                                    "locationId": locationObj,
                                    "building": buildingarray
                                });
                                callback();
                            }
                        });
                    }
                })
            }, function(err) {
                res.json(array);
            });
        },
        /**
         * Fetching user permissions
         */
        permissions: function(req, res) {
            if (!req.user) {
                return res.send([]);
            }
            var features = Object.keys(req.user.role.permissions);
            var allowedFeatures = [];
            async.each(features, function(feature, callback) {
                if (req.user.role.permissions[feature].read) {
                    allowedFeatures.push(feature);
                    callback();
                } else {
                    callback();
                }
            }, function(err) {
                var userFeatures = [];
                async.each(allowedFeatures, function(allowedFeature, callback) {
                    Feature.load(allowedFeature, function(err, userFeature) {
                        userFeature.access = req.user.role.permissions[userFeature._id];
                        userFeatures.push(userFeature);
                        callback();
                    });
                }, function(err) {
                    if (userFeatures.length > 0) {
                        userFeatures = _.sortBy(userFeatures, ['position']);
                    }
                    res.send(userFeatures);
                });
            });
        },
        userLocationAndBuilding: function(req, res) {
            var buildingArray = [],
                locationArray = [],
                array = [],
                uniqueLocation = [];
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            async.eachSeries(req.user.buildings, function(building, callback) {
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
        },
        /*
         * Generate current logged in user
         */
        fetchUser: function(req, res) {
            res.json(req.user);
        },
        /**
         * update current user profile details
         * */
        updateUserProfile: function(req, res) {
            var userprofile = req.user;
            userprofile = _.extend(userprofile, req.body);
            req.assert('firstname', 'You must enter firstname').notEmpty();
            req.assert('lastname', 'You must enter lastname').notEmpty();
            req.assert('email', 'You must enter email').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            userprofile.save(function(err) {
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
                } else res.json(userprofile);
            });
        },
        downloadXLSX: function(req, res) {
            var file = path.resolve(__dirname, '../../../../custom/actsec/public/assets/static/bulkupload_user_template.xlsx');
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);
            var filestream = fs.readFileSync(file, 'binary');
            res.write(filestream, 'binary');
            res.end();
        },

        updateUserTraining: function(req, res) {
            User.findOne({
                _id: req.body.userId
            }, function(err, user) {
                if (err) {
                    return res.status(500);
                }
                if (!user) {
                    return res.status(400);
                }
                async.waterfall([
                    function(callback) {
                        if (req.body.assign) {
                            user.trainings.push(req.body.trainingId);
                            callback();
                        } else {
                            user.trainings = user.trainings.filter(function(item) {
                                return JSON.stringify(item) !== JSON.stringify(req.body.trainingId);
                            });
                            callback();
                        }
                    },
                    function(callback) {
                        user.save(function(err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback();
                            }
                        });
                    }
                ], function(err, result) {
                    if (err) {
                        return res.status(500);
                    } else {
                        res.json(user);
                    }
                });
            });
        }
    };
}
