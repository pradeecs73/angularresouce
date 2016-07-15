'use strict';
/** Name : Feature Controller
 * Description : This controller retrieves the features created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 15-Jun-2016
 * @ METHODS: get
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	FeatureModel = mongoose.model('Feature'),
	_ = require('lodash');

module.exports = function(FeatureCtrl) {

	return {
		/**
		 * Loads the Feature based on id
		 */

		feature: function(req, res, next, id) {
			FeatureModel.load(id, function(err, feature) {
				if (err) {
					return next(err);
				}
				if (!feature) {
					return next(new Error('Failed to load feature ' + id));
				}
				req.feature = feature;
				next();
			});
		},

		/**
		 * Show the Feature
		 */
		show: function(req, res) {

			res.json(req.feature);
		},

		/**
		 * List of Features
		 */
		all: function(req, res) {

			FeatureModel.find().sort({
				name: 'asc'
			}).exec(function(err, features) {
				if (err) {
					return res.status(500).json({
						error: 'Cannot list the features'
					});
				}

				res.json(features);
			});
		}

	}
};