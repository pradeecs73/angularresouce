'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(BadgeCtrl, app, auth, database) {

	 var badgeCtrl = require('../controllers/badge')(BadgeCtrl);
		
	  app.route('/api/badge')
	  	.post(badgeCtrl.create)
	    .get(badgeCtrl.all);

	  app.route('/api/badge/:badgeId')
	  	.get(badgeCtrl.show)
	  	.put(badgeCtrl.update)
	  	.delete(badgeCtrl.destroy);
	  
	  app.param('badgeId', badgeCtrl.badge);
	  
  
};
