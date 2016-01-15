'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(FeatureCategory, app, auth, database) {

/*  app.get('/api/permission/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/api/permission/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/api/permission/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/api/permission/example/render', function(req, res, next) {
    Permission.render('index', {
      package: 'permission'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });*/
	var featurecategoryCtrl = require('../controllers/featurecategory')(FeatureCategory);
	
	//Pagination API
	  app.route('/api/featurecategory/pagination')
	      .get(featurecategoryCtrl.featurecategoryListByPagination);
	
	  app.route('/api/featurecategory')
	  	.post(featurecategoryCtrl.create)
	    .get(featurecategoryCtrl.all);

	  app.route('/api/featurecategory/:featurecategoryId')
	  	.get(featurecategoryCtrl.show)
	  	.put(featurecategoryCtrl.update)
	  	.delete(featurecategoryCtrl.destroy);
	  
	  app.param('featurecategoryId', featurecategoryCtrl.featurecategory);

};
