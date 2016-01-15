'use strict';

/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js'); 

var mongoose = require('mongoose'),
FeatureCategoryModel = mongoose.model('FeatureCategory'),
	_ = require('lodash');

module.exports = function (FeatureCategory) {

    return {

        /**
         * Find JobSite by id
         */
    	featurecategory: function (req, res, next, id) {
    		FeatureCategoryModel.load(id, function (err, featurecategory) {
                if (err) return next(err);
                if (!featurecategory) return next(new Error('Failed to load featurecategory ' + id));
                req.featurecategory = featurecategory;
                next();
            });
        },
         
        /**
         * Create an jobSite
         */
        /*create: function (req, res) {
            var featurecategory = new FeatureCategoryModel(req.body);
            featurecategory.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the featurecategory'
                    });
                }

                res.json(featurecategory);
            });
        },
*/        
        create: function (req, res) {
            var featurecategory = new FeatureCategoryModel(req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter name').notEmpty();
            req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('parent', 'You must enter parent').notEmpty();
                var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featurecategory.save(function (err) {
                if (err) {
                	switch (err.code) {
                    case 11000:
                    case 11001:
                    res.status(400).json([{
                        msg: 'name already taken',
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

                res.json(featurecategory);
            });
        },


        /**
         * Update an jobSite
         */
        /*update: function (req, res) {
            var featurecategory = req.featurecategory;
            
            
            featurecategory = _.extend(featurecategory, req.body);
            featurecategory.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the featurecategory'
                    });
                }

                res.json(featurecategory);
            });
        },
*/    
        update: function (req, res) {
            var featurecategory = req.featurecategory;
            featurecategory = _.extend(featurecategory, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter name').notEmpty();
            req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('parent', 'You must enter parent').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featurecategory.save(function (err) {
                if (err) {
                	switch (err.code) {
                    case 11000:
                    case 11001:
                    res.status(400).json([{
                        msg: 'name already taken',
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

                res.json(featurecategory);
            });
        },

        /**
         * Delete a jobSite
         */
        destroy: function (req, res) {
            var featurecategory = req.featurecategory;
            
            featurecategory.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the featurecategory'
                    });
                }

                res.json(featurecategory);
            });
        },
        
        /**
         * Show an jobSite
         */
        show: function (req, res) {
            res.json(req.featurecategory);
        },
        
        /**
         * List of jobSite
         */
        all: function (req, res) {
        	FeatureCategoryModel.find().exec(function (err, featurecategory) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the featurecategory'
                    });
                }

                res.json(featurecategory);
            });
        },
        
        /**
         * List of feature category as by pagination
         */
		featurecategoryListByPagination: function (req, res) {
           var populateObj = {};
           utility.pagination(req, res, FeatureCategoryModel, {}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                   //res.json(result);
               }
               
               return res.json(result);
           });
       },
        
    };
}