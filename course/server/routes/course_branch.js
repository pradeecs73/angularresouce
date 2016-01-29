'use strict';

var hasAuthorization = function(req, res, next) {
	if (!req.user.isAdmin && !req.Course.user._id.equals(req.user._id)) {
		return res.status(401).send('User is not authorized');
	}
	next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseBranch, app, auth, database) {

	var courseBranchCtrl = require('../controllers/course_branch')(CourseBranch);
	
	app.route('/api/course/:courseId/payment-scheme/branch/:branchId')
		.put(courseBranchCtrl.assignCourseToBranch)
		.get(courseBranchCtrl.removeCourseFromBranch);
	
	app.route('/api/course/:courseId/payment-scheme/city/:cityId')
		.put(courseBranchCtrl.assignCourseToMultipleBranch);

	app.param('branchId', courseBranchCtrl.branch);
	app.param('courseId', courseBranchCtrl.course);
	app.param('cityId', courseBranchCtrl.city);

};
