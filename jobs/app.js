'use strict';
/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var Jobs = new Module('jobs');
/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Jobs.register(function(app, auth, database) {
    //We enable routing. By default the Package Object is passed to the routes
    Jobs.routes(app, auth, database);
    //We are adding a link to the main menu for all authenticated users
    Jobs.menus.add({
        title: 'jobs example page',
        link: 'jobs example page',
        roles: ['authenticated'],
        menu: 'main'
    });
    Jobs.aggregateAsset('css', 'jobs.css');
    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Jobs.settings({
    	  'someSetting': 'some value'
      }, function(err, settings) {
    	  //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Jobs.settings({
    	  'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Jobs.settings(function(err, settings) {
    	  //you now have the settings object
      });
      */
    return Jobs;
});