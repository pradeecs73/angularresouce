'use strict';
/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js'); 

var mongoose = require('mongoose'), SiteModel = mongoose.model('Site'), _ = require('lodash');
module.exports = function(SiteCtrl) {
	return {
		/**
		 * Find site by id
		 */
		site : function(req, res, next, id) {
			SiteModel.load(id, function(err, site) {
				if (err) {
					return next(err);
				}
				if (!site) {
					return next(new Error('Failed to load site ' + id));
				}
				req.site = site;
				next();
			});
		},
		/**
		 * Create an site
		 */
		create : function(req, res) {
			console.log(req.body);
			var site = new SiteModel(req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
			req.assert('websiteName', 'Please enter Site Name').notEmpty();
			req.assert('websiteUrl', 'You must enter Site Url').notEmpty();
			req.assert('siteUsername', 'You must enter Site Username').notEmpty();
			req.assert('sitePassword', 'You must enter Site Password').notEmpty();
			req.assert('apiUrl', 'You must enter API Url').notEmpty();
			req.assert('apiSecret', 'You must enter API Secret').notEmpty();
			req.assert('apiSiteId', 'You must enter API Site Id').notEmpty();
			req.assert('checkLoginAPIendpoint', 'You must enter checkLogin API Endpoint').notEmpty();
			req.assert('getUserInfoAPIendpoint', 'You must enter GetUserInfo API Endpoint').notEmpty();
			req.assert('getSingleJobAPIendpoint', 'You must enter GetSingleJob API Endpoint').notEmpty();
			req.assert('getAllJobsAPIendpoint', 'You must enter GetAllJobs API Endpoint').notEmpty();
			
			var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
			site.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Website Name already exists',
							param : 'websiteName'
						} ]);
						break;
					    default:
						var modelErrors = [];
					    
						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod'+modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				    }
				res.json(site);
			});
		},
		/**
		 * Update an site 
		 */
		update : function(req, res) {
			var site = req.site;
			site = _.extend(site, req.body);
			
			req.assert('websiteName', 'Please enter website Name').notEmpty();
			req.assert('websiteUrl', 'You must enter website Url').notEmpty();
			req.assert('siteUsername', 'You must enter username').notEmpty();
			req.assert('sitePassword', 'You must enter password').notEmpty();
			req.assert('apiUrl', 'You must enter API Url').notEmpty();
			req.assert('apiSecret', 'You must enter API Secret').notEmpty();
			req.assert('apiSiteId', 'You must enter API Site Id').notEmpty();
			req.assert('checkLoginAPIendpoint', 'You must enter checkLogin API Endpoint').notEmpty();
			req.assert('getUserInfoAPIendpoint', 'You must enter GetUserInfo API Endpoint').notEmpty();
			req.assert('getSingleJobAPIendpoint', 'You must enter GetSingleJob API Endpoint').notEmpty();
			req.assert('getAllJobsAPIendpoint', 'You must enter GetAllJobs API Endpoint').notEmpty();

			var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
			site.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Website Name already exists',
							param : 'websiteName'
						} ]);
						break;
					    default:
						var modelErrors = [];
						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod'+modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				    }
				res.json(site);
			});
		},
		/**
		 * Delete a site
		 */
		destroy : function(req, res) {
			var site = req.site;
			
			site.remove(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot delete the site'
					});
				}
				res.json(site);
			});
		},
		
		/**
		 * Show an site
		 */
		show : function(req, res) {
			res.json(req.site);
		},
		
		/**
		 * List of sites
		 */
		all : function(req, res) {
			SiteModel.find().exec(function(err, sites) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the sites'
					});
				}
				res.json(sites);
			});
		},
		
		/**
         * List of site as by pagination
         */
		siteListByPagination: function (req, res) {
           var populateObj = {};
           utility.pagination(req, res, SiteModel, {}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                   //res.json(result);
               }
               
               return res.json(result);
           });
       },
	};

}