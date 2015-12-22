'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.City.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(City, app, auth, database) {

  var cityCtrl = require('../controllers/city')(City);
	
  app.route('/api/zone/:zoneId/city')
  	.post(auth.requiresLogin, hasAuthorization,cityCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,cityCtrl.all);

  app.route('/api/city/:cityId')
  	.get(auth.requiresLogin, hasAuthorization,cityCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,cityCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,cityCtrl.destroy);
  
  app.param('zoneId', cityCtrl.zone);
  app.param('cityId', cityCtrl.city);
  
};
