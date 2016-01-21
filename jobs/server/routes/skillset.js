'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Skillset, app, auth, database) {

	 var SkillsetCtrl =require('../controllers/skillset')(Skillset, app);
	 
	//Pagination API
	   
	  app.route('/api/skillset',auth.requiresLogin)
	  	.post(SkillsetCtrl.create);
	  	
	  	app.route('/api/skillset/:skillsetId',auth.requiresLogin)
	  	    .get(SkillsetCtrl.singleskillsetdetail)
	  	    .put(SkillsetCtrl.skillsetupdate)
	  	    .delete(SkillsetCtrl.skillsetdelete);


	   app.route('/api/skillsetdetails/pagination',auth.requiresLogin)
	  	.get(SkillsetCtrl.fetchallskillset); 	
	   
        app.param('skillsetId', SkillsetCtrl.skillset);
};
