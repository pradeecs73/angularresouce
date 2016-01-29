'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CoursetopicCtrl, app, auth, database) {

	 var CoursetopicCtrl = require('../controllers/course_topic')(CoursetopicCtrl);
	 
	 
	  app.route('/api/courselesson/:courselessonId/coursetopic')
	  	.post(CoursetopicCtrl.create)
	    .get(CoursetopicCtrl.all);

	  app.route('/api/coursetopic/:coursetopicId')
	  	.get(CoursetopicCtrl.show)
	  	.put(CoursetopicCtrl.update)
	  	.delete(CoursetopicCtrl.destroy);
	  
	  app.param('courselessonId', CoursetopicCtrl.courselesson);
	  app.param('coursetopicId', CoursetopicCtrl.coursetopic);

};
