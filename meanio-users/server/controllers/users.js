'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Feature = mongoose.model('Feature'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    randtoken = require('rand-token'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    _ = require('lodash'),
    mail = require('../../../meanio-system/server/services/mailService.js'),
    fs=require('fs'),
    jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken
var auth = require('../../authorization.js');
var XLSX = require('xlsx');
var filein = ('/test.xlsx');
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

var validateUserObj = function(userObj, callbackUO){
                var user = userObj;
                req.assert('name', 'Please enter name').notEmpty();
                req.assert('email', 'Please enter email').notEmpty();
                req.assert('username', 'Please enter username').notEmpty();
                var errors = [];
                var validationError = req.validationErrors()
                if (Array.isArray(validationError)) {
                    errors = errors.concat(req.validationErrors());
                }
                if (errors.length > 0) {
                    return res.status(400).send(errors);
                }
                callbackSave(null, userObj);
};


var postDocumentFile = function(req, res, err, fields, files) {
    var pathObj = {};
    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var tmpPath = file.path;
    var extIndex = tmpPath.lastIndexOf('.');
    var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
    var fileName = uuid.v4() + extension;
    var destination_file = __dirname+"/../../../../contrib/meanio-system/useruplaod/"; //path should be assign in config file and that variable used here
    pathObj.temp = tmpPath;
    pathObj.dest = destination_file;
    pathObj.fileName = fileName;
    return pathObj;
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
            if (!req.cookies.redirect) res.cookie('redirect', destination);
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
        bulkUploadUsers: function(req, res,file) {
            var finalUser = {};
            finalUser.success = [];
            finalUser.failure = [];
            var workbook = XLSX.readFile('test.xlsx');
            var result = {};
            result.sheetName = [];
            var validSheet = [];
            var error=[]
            var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
            if (roa.length > 0) {
                result.sheetName = roa;
            }
            /* waterfall starts*/
            async.waterfall([ function(done){

              var form = new multiparty.Form();
                form.parse(req, function(err, fields, files) {
                    var filePath = postDocumentFile(req, res, err, fields, files);
                    var dir = filePath.dest;
                  
                    dir = dir + '/' + filePath.fileName;
                    var is = fs.createReadStream(filePath.temp);
                    var os = fs.createWriteStream(dir);
                    is.pipe(os);
                    is.on('end', function() {
                        fs.unlinkSync(filePath.temp);
                    });
                    filePath.dirPath = '/meanio-system/useruplaod/';
                    res.json(filePath.dirPath + filePath.fileName);
                });

            },function(done) { 
               finalUser.success=result.sheetName;
               done(null,finalUser);      

            }, function (finalUser, done) {
              async.each(finalUser.success, function(successObj, callbackSuccess) {
  
                    var user = new User(successObj);

                     user.save(function(err) {
                        if(err)
                       {
                         error.push(err);
                         callbackSuccess();
                       } 
                     else{ 
                          callbackSuccess();
                      }
                });

                    
                }, function(err) {
                    if(error.length > 0) {

                        res.status(400).json([{
                                    code: 10001,
                                    msg: 'email already exists',
                                    param: 'email'
                                }]);
                       
                    } else {
                      done(null,finalUser);
                    }
                });

            },function(finalUser,done){

                 /*async.each(finalUser.success, function(successEmailObj, callbackEmail) {

                        mail.mailServiceBulkUpload(successEmailObj.email);
                        callbackEmail();

                    }, function(err) {
                        if(err) {
                            return res.status(500).json({
                                error: 'Error while sending mail to user ' + err
                            });
                        } else {
                          done();
                        }
                    });*/

                  done();


            }

            ], function(err, result) {
                if(err) {
                    return res.status(500).json({
                        error: 'Error while creating users ' + err
                    });
                }else{
                res.json(finalUser);
                }
            });
            //return res.status(200).json(result.sheetName);
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
                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        return res.send({
                            user: user
                        });
                    });
                });
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
                        $or: [{
                            email: req.body.text
                        }, {
                            username: req.body.text
                        }]
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
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
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
                user.company = req.user.company;
                req.assert('firstname', 'You must enter a firstname').notEmpty();
                req.assert('lastname', 'You must enter a lastname').notEmpty();
                req.assert('email', 'You must enter a valid email address').isEmail();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
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
                        
                    } else {
                        var email = templates.userCredentialtemplate(req, user, token)
                        mail.mailService(email, user.email)
                        res.status(200).json(user);
                    }
                });
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
                company: req.user.company._id
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
                var user = req.user;
                user = _.extend(user, req.body);
                req.assert('firstname', 'You must enter a firstname').notEmpty();
                req.assert('lastname', 'You must enter a lastname').notEmpty();
                req.assert('email', 'You must enter a valid email address').isEmail();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
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
                    } else res.json(user);
                });
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
        /*      deleteUser: function(req, res){
                    var user = req.user;
                    user.active = false; 
                    user.save(function(err){
                        if(err){
                            res.send(err);
                        }
                        res.json(user);
                    });
                },*/
        deleteUser: function(req, res) {
            var user = req.profile;
            user.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the amenity'
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
                        var token = randtoken.generate(10);
                        user.confirmationToken = token;
                        user.save(function(err) {
                            if (err) {}
                            var email = templates.loginMailTemplate(user)
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
            var locationArray = [];
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
                    } else {
                        BuildingModel.find({
                            location: location
                        }, function(err, buildingarray) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                array.push({
                                    "locationId": locationObj,
                                    "building": buildingarray
                                });
                            }
                        });
                        callback();
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
    };
}