'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Mypractise, app, auth, database) {

  var myproduct = require('../controllers/mypractise')(Mypractise, app);

  app.get('/api/mypractise/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/api/mypractise/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/api/mypractise/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/api/mypractise/example/render', function(req, res, next) {
    Mypractise.render('index', {
      package: 'mypractise'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });

   app.route('/api/addproduct', auth.requiresLogin)
        .post(myproduct.addproduct)

   app.route('/api/retreiveproduct',auth.requiresLogin)
        .get(myproduct.retreiveproduct)
        
   app.route('/api/editproduct',auth.requiresLogin)
        .post(myproduct.editproduct)
        
    app.route('/api/deleteproduct',auth.requiresLogin)
        .post(myproduct.deleteproduct)

    app.route('/api/products',auth.requiresLogin)
        .post(myproduct.addresourceproducts)
        .get(myproduct.retreiveallproducts)
        
          

    app.route('/api/products/:productid',auth.requiresLogin)
        .put(myproduct.updateresourceproducts)
        .get(myproduct.retreiveresourceproducts)  
        .delete(myproduct.deleteproducts)             

};
