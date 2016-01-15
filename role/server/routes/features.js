'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.FeatureCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* JSHint -W098 */
//This Package is passed automatically as first parameter


module.exports = function (FeatureCtrl, app, auth, database) {

    var featurectrl = require('../controllers/features')(FeatureCtrl);


//Pagination API
    app.route('/api/feature/pagination')
        .get(auth.requiresLogin, hasAuthorization,featurectrl.roleListByPagination);
    // APIS
    app.route('/api/feature')
        .post(auth.requiresLogin, hasAuthorization, featurectrl.create)
        .get(auth.requiresLogin, hasAuthorization, featurectrl.all);

    app.route('/api/feature/:featureId')
        .get(auth.requiresLogin, hasAuthorization, featurectrl.show)
        .put(auth.requiresLogin, hasAuthorization, featurectrl.update)
        .delete(auth.requiresLogin, hasAuthorization, featurectrl.destroy);

    //  Fetch the feature by its ID (featureId) from the database

    app.param('featureId', featurectrl.feature);


};