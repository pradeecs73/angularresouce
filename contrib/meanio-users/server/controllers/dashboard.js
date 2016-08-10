'use strict';
/** Name : Dashboard Controller
 * Description : This controller retrieves the dashboard components created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 15-Jun-2016
 * @ METHODS: get
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	DashboardModel = mongoose.model('Dashboard'),
	_ = require('lodash');

module.exports = function(DashboardCtrl) {

	return {
		/**
		 * Loads the Feature based on id
		 */

		dashboard: function(req, res, next, id) {
			DashboardModel.load(id, function(err, dashboard) {
				if (err) {
					return next(err);
				}
				if (!dashboard) {
					return next(new Error('Failed to load dashboard ' + id));
				}
				req.dashboard = dashboard;
				next();
			});
		},

		/**
		 * Show the Dashboard components
		 */
		show: function(req, res) {

			res.json(req.dashboard);
		},

		/**
		 * List of Dashboard components
		 */
		all: function(req, res) {

			DashboardModel.find().exec(function(err, dashboards) {
				if (err) {
					return res.status(500).json({
						error: 'Cannot list the Dashboard items'
					});
				}

				res.json(dashboards);
			});
		}

	}
};