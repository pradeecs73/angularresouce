'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	CountryModel = mongoose.model('Country'),
	CityModel = mongoose.model('City'),
   fs = require("fs"),
    _ = require('lodash');

/*	var fs = require('fs');

var mongoose = require('mongoose');
var generator = require('mongoose-gen');

// load json
var data = fs.readFileSync('./book.json', {encoding: 'utf8'});
var bookJson = JSON.parse(data);*/

// In the above _book.json_ file there is a `validateBookYear` token.
// mongoose-gen uses this token to lookup an actual validator function which
// should be registered beforehand. This is how to register validators.



module.exports = function (Country) {

    return {


      /*  generator.setValidator('validateBookYear', function (value) {
            return (value <= 2015);
        });

                // Generate the Schema object.
        var BookSchema = new mongoose.Schema(generator.convert(bookJson));

        // Connect to mongodb and bind the book model.
        mongoose.connect('mongodb://localhost:27017/test-mongoose-gen');
        var BookModel = mongoose.model('Book', BookSchema);*/
        /**
         * Find country by id
         */
        country: function (req, res, next, id) {
        	CountryModel.load(id, function (err, country) {
                if (err) return next(err);
                if (!country) return next(new Error('Failed to load country ' + id));
                req.country = country;
                next();
            });
        },
        
        /**
         * Create an country
         */
        create: function (req, res) {
        
        	 var country = new CountryModel(req.body);
        
             // because we set our user.provider to local our models/user.js validation will always be true
             req.assert('countryName', 'You must enter a country name').notEmpty();
             req.assert('countryCode', 'You must enter country code').notEmpty();
             req.assert('currency', 'You must enter country currency').notEmpty();
             req.assert('languageName', 'You must enter country language name').notEmpty();
             req.assert('languageCode', 'You must enter country language code').notEmpty();
        
             var errors = req.validationErrors();
             if (errors) {
                 return res.status(400).send(errors);
             }
             country.save(function(err) {
                 if (err) {
                     switch (err.code) {
                         case 11000:
                         case 11001:
                         res.status(400).json([{
                             msg: 'Countryname already taken',
                             param: 'countryName'
                         }]);
                         break;
                         default:
                         var modelErrors = [];

                         if (err.errors) {

                             for (var x in err.errors) {
                                 modelErrors.push({
                                     param: x,
                                     msg: err.errors[x].message,
                                     value: err.errors[x].value
                                 });
                             }
                             console.log('mod'+modelErrors);
                             res.status(400).json(modelErrors);
                         }
                     }
                    return res.status(400);
                 }
                 res.json(country);
                 
             });
        },
             

            /**
         * Create an country
         */
        countrylist: function (req, res) {
            fs.readFile('input.txt', function (err, data) {
            if (err) {
                   return console.error(err);
               }
               console.log("Asynchronous read: " + data.toString());
            });
            return res.status(200).json(data);
        },
        
        
        
        /**
         * Update an country
         */
        update: function (req, res) {
            var country = req.country;
            country = _.extend(country, req.body);
            
            req.assert('countryName', 'You must enter a country name').notEmpty();
            req.assert('countryCode', 'You must enter country code').notEmpty();
            req.assert('currency', 'You must enter country currency').notEmpty();
            req.assert('languageName', 'You must enter country language name').notEmpty();
            req.assert('languageCode', 'You must enter country language code').notEmpty();
       
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            country.save(function (err) {
            	 if (err) {
                     switch (err.code) {
                         case 11000:
                         case 11001:
                             res.status(400).json([
                                 ERRORS.ERROR_001
                             ]);
                             break;
                         default:
                             var modelErrors = [];

                             if (err.errors) {

                                 for (var x in err.errors) {
                                     modelErrors.push({
                                         param: x,
                                         msg: err.errors[x].message,
                                         value: err.errors[x].value
                                     });
                                 }

                                 res.status(400).json(modelErrors);
                             }
                     }
                     return res.status(400);
                 }
                res.json(country);
            });
        },
        
        /**
         * Delete a country
         */
        destroy: function (req, res) {
            var country = req.country;
            
            country.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the country'
                    });
                }

                res.json(country);
            });
        },
        
        /**
         * Show an country
         */
        show: function (req, res) {
            res.json(req.country);
        },
        
        /**
         * List of Countries
         */
        all: function (req, res) {
        	CountryModel.find().populate('zone').exec(function (err, countries) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the countries'
                    });
                }

                res.json(countries);
            });
        },
        

        /**
         * List of Countries
         */
        locationTreeViewJSON: function (req, res) {
        	CountryModel.find().populate('zone').exec(function (err, countries) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the countries'
                    });
                }
                
            	CityModel.find().populate('branch').exec(function (err, cities) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the cities'
                        });
                    }
                    console.log(cities);
                    for(var i = 0; i < countries.length; i++){
                    	for(var j = 0; j < countries[i].zone.length; j++){
                    		countries[i].zone[j].cities=[];
                    		console.log("city set");
                    	}
                    }
                    for(var t = 0; t < cities.length; t++){
	                    for(var i = 0; i < countries.length; i++){
	                    	for(var j = 0; j < countries[i].zone.length; j++){
		                    	if(JSON.stringify(countries[i].zone[j]._id) === JSON.stringify(cities[t].zone)){
		                    		console.log(cities[t]);
		                    		countries[i].zone[j].cities.push(cities[t]);
		                    		console.log('true :' +countries[i].zone[j].city);
		                    		break;
		                    	}
	                    	}
	                    }
                    }
                    res.json(countries);
                });
            });
        }
        
    };
}

