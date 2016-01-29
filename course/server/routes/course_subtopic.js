'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CoursesubtopicCtrl, app, auth, database) {

	 var CoursesubtopicCtrl = require('../controllers/course_subtopic')(CoursesubtopicCtrl);
	 
	
	  app.route('/api/coursetopic/:coursetopicId/coursesubtopic')
	  	.post(CoursesubtopicCtrl.create)
	    .get(CoursesubtopicCtrl.all);

	  app.route('/api/coursesubtopic/:coursesubtopicId')
	  	.get(CoursesubtopicCtrl.show)
	  	.put(CoursesubtopicCtrl.update)
	  	.delete(CoursesubtopicCtrl.destroy);
	  
	  app.param('coursetopicId', CoursesubtopicCtrl.coursetopic);
	  app.param('coursesubtopicId', CoursesubtopicCtrl.coursesubtopic);

};
