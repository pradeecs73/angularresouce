'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Zone.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Zone, app, auth, database) {

  var zoneCtrl = require('../controllers/zone')(Zone);
	
  app.route('/api/country/:countryId/zone')
  	.post(auth.requiresLogin, hasAuthorization,zoneCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,zoneCtrl.all);

  app.route('/api/zone/:zoneId')
  	.get(auth.requiresLogin, hasAuthorization,zoneCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,zoneCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,zoneCtrl.destroy);
  
  app.param('countryId', zoneCtrl.country);
  app.param('zoneId', zoneCtrl.zone);
  
};
