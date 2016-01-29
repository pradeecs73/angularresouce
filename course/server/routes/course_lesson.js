'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourselessonCtrl, app, auth, database) {

	 var CourselessonCtrl = require('../controllers/course_lesson')(CourselessonCtrl);
	 
	 
	  app.route('/api/coursechapter/:coursechapterId/courselesson')
	  	.post(CourselessonCtrl.create)
	    .get(CourselessonCtrl.all);

	  app.route('/api/courselesson/:courselessonId')
	  	.get(CourselessonCtrl.show)
	  	.put(CourselessonCtrl.update)
	  	.delete(CourselessonCtrl.destroy);
	  
	  app.param('coursechapterId', CourselessonCtrl.coursechapter);
	  app.param('courselessonId', CourselessonCtrl.courselesson);

};
