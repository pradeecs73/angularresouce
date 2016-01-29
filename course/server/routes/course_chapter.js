'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CoursechapterCtrl, app, auth, database) {

	 var CoursechapterCtrl = require('../controllers/course_chapter')(CoursechapterCtrl);
	 
	  app.route('/api/coursechapter')
	  	.post(CoursechapterCtrl.create)
	    .get(CoursechapterCtrl.all);

	  app.route('/api/coursechapter/:coursechapterId')
	  	.get(CoursechapterCtrl.show)
	  	.put(CoursechapterCtrl.update)
	  	.delete(CoursechapterCtrl.destroy);
	  
	  app.param('coursechapterId', CoursechapterCtrl.coursechapter);

};
