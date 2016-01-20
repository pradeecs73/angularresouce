'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Skillset, app, auth, database) {

	 var SkillsetCtrl =require('../controllers/skillset')(Skillset, app);
	 
	//Pagination API
	   
	  app.route('/api/skillset')
	  	.post(SkillsetCtrl.create);
	  	
	  	app.route('/api/skillset/:skillsetId')
	  	    .delete(SkillsetCtrl.skillsetdelete);

	   app.route('/api/skillset/pagination')
	  	.get(SkillsetCtrl.fetchallskillset); 	
	   
        app.param('skillsetId', SkillsetCtrl.skillset);
};
