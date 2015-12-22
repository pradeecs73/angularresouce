'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Country.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Country, app, auth, database) {

  var countryCtrl = require('../controllers/country')(Country);
	
  app.route('/api/country')

	.post(auth.requiresLogin, hasAuthorization,countryCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,countryCtrl.all);

  
  app.route('/api/location')
	.get(countryCtrl.locationTreeViewJSON);

  app.route('/api/country/:countryId')
  	.get(auth.requiresLogin, hasAuthorization,countryCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,countryCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,countryCtrl.destroy);
  
  app.param('countryId', countryCtrl.country);
  
};
