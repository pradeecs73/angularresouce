'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(SkillCtrl, app, auth, database) {

	 var skillCtrl = require('../controllers/skill')(SkillCtrl);
		
	 //Pagination API
	  app.route('/api/skill/pagination')
	      .get(skillCtrl.skillListByPagination);
	 
	  app.route('/api/skill')
	  	.post(skillCtrl.create)
	    .get(skillCtrl.all);

	  app.route('/api/skill/:skillId')
	  	.get(skillCtrl.show)
	  	.put(skillCtrl.update)
	  	.delete(skillCtrl.destroy);
	  
	  app.param('skillId', skillCtrl.skill);
	  
  
};
