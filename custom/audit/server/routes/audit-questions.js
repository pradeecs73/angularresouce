'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter

/**
 * Checks the authentication for user.
 */

var hasAuthentication = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send("User Is Not Authorized");
    }
    next();
};

module.exports = function(AuditQuestionCtrl, app, auth, database) {

    var AuditQueCtrl = require('../controllers/audit-questions')(AuditQuestionCtrl);

    /**
     * APIs for Audit Question
     */
    app.route('/api/auditQuestion')
        .post(hasAuthentication, AuditQueCtrl.create)
        .get(hasAuthentication, AuditQueCtrl.all);
    

    app.route('/api/auditQuestion/:auditQuestionId')
        .get(hasAuthentication, AuditQueCtrl.show)
        .put(hasAuthentication, AuditQueCtrl.update)
        .delete(hasAuthentication, AuditQueCtrl.destroy);

    app.param('auditQuestionId', AuditQueCtrl.auditQuestion);
};