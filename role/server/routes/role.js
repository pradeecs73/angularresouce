'use strict';
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.RoleCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function (RoleCtrl, app, auth, database) {

 var rolectrl = require('../controllers/role')(RoleCtrl);


//Pagination API
 app.route('/api/role/pagination')
     .get(rolectrl.roleListByPagination);
    
 // APIS
 app.route('/api/role')
     .post(auth.requiresLogin, hasAuthorization, rolectrl.create)
     .get(auth.requiresLogin, hasAuthorization, rolectrl.all);

 app.route('/api/role/:roleId')    
     .get(auth.requiresLogin, hasAuthorization, rolectrl.show)
     .put(auth.requiresLogin, hasAuthorization,rolectrl.update)
     .delete(auth.requiresLogin, hasAuthorization, rolectrl.destroy);
 
 app.route('/api/role/student/user')
 .get(rolectrl.loadRoleOfStudent);  
 
 app.route('/api/role/admin/user')    
 .get(rolectrl.loadRoleOfAdmin);
 //  Fetch the role by its ID (roleId) from the database
 
 app.route('/api/admin/user/role/pagination')    
 .get(rolectrl.loadUserBasedOnRole);
 
 app.param('roleId', rolectrl.role);


};