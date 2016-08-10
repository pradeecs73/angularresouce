'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function(DashboardCtrl, app, auth, database) {

	var dashboardCtrl = require('../controllers/dashboard')(DashboardCtrl);

	// APIS
	app.route('/api/dashboard')
		.get(dashboardCtrl.all);

	app.route('/api/dashboard/:dashboardId')
		.get(dashboardCtrl.show);

	app.param('dashboardId', dashboardCtrl.dashboard);
};