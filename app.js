'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Mypractise = new Module('mypractise');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Mypractise.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Mypractise.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Mypractise.menus.add({
    title: 'Add a product',
    link: 'mypractise example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Mypractise.aggregateAsset('css', 'mypractise.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Mypractise.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Mypractise.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Mypractise.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Mypractise;
});
