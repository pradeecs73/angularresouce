'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.FeatureroleCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function (FeatureroleCtrl, app, auth, database) {

    var featurerolectrl = require('../controllers/featurerole')(FeatureroleCtrl);


    // APIS
    app.route('/api/featurerole')
        .post(auth.requiresLogin, hasAuthorization, featurerolectrl.create)
        .get(auth.requiresLogin, hasAuthorization, featurerolectrl.all);

    app.route('/api/featurerole/:featureroleId')
        .get(auth.requiresLogin, hasAuthorization, featurerolectrl.show)
        .put(auth.requiresLogin, hasAuthorization, featurerolectrl.update)
        .delete(auth.requiresLogin, hasAuthorization, featurerolectrl.destroy);
    app.route('/api/featurerole/role/:role')
        .get(featurerolectrl.featurerolebyRole)
    app.route('/api/user/role/:userId')
        .get(featurerolectrl.useronRoles)
    //  Fetch the role by its ID (roleId) from the database

    app.param('featureroleId', featurerolectrl.featurerole);
    app.param('role', featurerolectrl.role);
    app.param('userId', featurerolectrl.user);
};