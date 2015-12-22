'use strict';
//Article authorization helpers
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Branch.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Branch, app, auth, database) {

  var branchCtrl = require('../controllers/branch')(Branch);
	
  app.route('/api/city/:cityId/branch')
  	.post(auth.requiresLogin, hasAuthorization,branchCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,branchCtrl.all);

  app.route('/api/branch/:branchId')
  	.get(auth.requiresLogin, hasAuthorization,branchCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,branchCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,branchCtrl.destroy);
  
  app.route('/api/branch/picture/branchPicture')
  	.post(auth.requiresLogin, hasAuthorization,branchCtrl.uploadBranchPic);
  
  app.param('cityId', branchCtrl.city);
  app.param('branchId', branchCtrl.branch);
  
};
