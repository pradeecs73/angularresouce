'use strict';

/**
 * Module dependencies.
 */

require('../models/city.js');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');

var mongoose = require('mongoose'),
	BranchModel = mongoose.model('Branch'),
	CityModel = mongoose.model('City'),
    _ = require('lodash');


var postBranchImage = function(req, res, err, fields, files) {
	var pathObj = {};
	var file = files.file[0];
	var contentType = file.headers['content-type'];
	var tmpPath = file.path;
	var extIndex = tmpPath.lastIndexOf('.');
	var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);

	// uuid is for generating unique filenames.it
	var fileName = uuid.v4() + extension;

	var destination_file = __dirname
			+ '/../../../../core/system/public/assets/uploads/';
	console.log(destination_file);

	// Server side file type checker.//
	/*
	 * if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
	 * fs.unlink(tmpPath); return res.status(400).send('Unsupported file
	 * type.'); }
	 */

	pathObj.temp = tmpPath;
	pathObj.dest = destination_file;
	pathObj.fileName = fileName;
	return pathObj;
}

module.exports = function (Branch) {

    return {

    	/**
         * Find city by id
         */
        city: function (req, res, next, id) {
        	console.log(id);
        	CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
        },
    	
        /**
         * Find branch by id
         */
        branch: function (req, res, next, id) {
        	BranchModel.load(id, function (err, branch) {
                if (err) return next(err);
                if (!branch) return next(new Error('Failed to load branch ' + id));
                req.branch = branch;
                next();
            });
        },
        
        /**
         * Create a branch
         */
        create: function (req, res) {
            var branch = new BranchModel(req.body);
            branch.city = new CityModel(req.city);
            var cityId=req.body.cityId;
            
            req.assert('branchName', 'You must enter a branch name').notEmpty();
            req.assert('branchCode', 'You must enter branch code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            
            branch.save(function (err) {
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                        res.status(400).json([{
                            msg: 'Countryname already taken',
                            param: 'countryName'
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
                            console.log('mod'+modelErrors);
                            res.status(400).json(modelErrors);
                        }
                    }
                   return res.status(400);
                }
                else{

                    CityModel.findOne(
                                   { _id: cityId },function (err, cityDocument){
                                     var branchid=branch._id;
                                    cityDocument.branch.push(branchid);
                                    cityDocument.save(function (err,items) {
                                        if(err){

                                            console.log(err);
                                        }

                                    });
 
                               }                           
                            ); 
                   res.json(branch);
                 }
            });
        },
        
        /**
         * Update a branch
         */
        update: function (req, res) {
            var branch = req.branch;
            branch = _.extend(branch, req.body);
            
            req.assert('branchName', 'You must enter a branch name').notEmpty();
            req.assert('branchCode', 'You must enter branch code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            branch.save(function (err) {
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
                }

                res.json(branch);
            });
        },
        
        /**
         * Delete a branch
         */
        destroy: function (req, res) {
            var branch = req.branch;
            
            branch.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the branch'
                    });
                }

                res.json(branch);
            });
        },
        
        /**
         * Show a branch
         */
        show: function (req, res) {
            res.json(req.branch);
        },
        
        /**
         * List of Branches
         */
        all: function (req, res) {
        	var cityId = req.city._id;
        	BranchModel.find({city : cityId}).exec(function (err, branches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the branches'
                    });
                }

                res.json(branches);
            });
        },
        
        uploadBranchPic : function(req, res) {

			var form = new multiparty.Form();
			form.parse(req, function(err, fields, files) {
				var filePath =postBranchImage(req, res, err, fields, files);
				var dir = filePath.dest + 'Branch/';
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}


				dir = filePath.dest + 'Branch/';

				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				dir = dir + '/' + filePath.fileName;
				var is = fs.createReadStream(filePath.temp);
				var os = fs.createWriteStream(dir);
				is.pipe(os);
				is.on('end', function() {
					fs.unlinkSync(filePath.temp);
				});
				filePath.dirPath = '/system/assets/uploads/Branch/';
				res.json(filePath.dirPath+ filePath.fileName);
		});
        }
        
    };
}