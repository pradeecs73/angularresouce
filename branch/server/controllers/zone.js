'use strict';

/**
 * Module dependencies.
 */

require('../models/country.js');

var mongoose = require('mongoose'),
	ZoneModel = mongoose.model('Zone'),
	CountryModel = mongoose.model('Country'),
    _ = require('lodash');

module.exports = function (Zone) {

    return {

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
         * Find zone by id
         */
        zone: function (req, res, next, id) {
        	ZoneModel.load(id, function (err, zone) {
                if (err) return next(err);
                if (!zone) return next(new Error('Failed to load zone ' + id));
                req.zone = zone;
                next();
            });
        },
        
        /**
         * Create a zone
         */
        create: function (req, res) {
            var zone = new ZoneModel(req.body);
            zone.country = new CountryModel(req.country);
            var countryId=req.body.countryId;
            
            //validations
            req.assert('zoneName', 'You must enter a zone name').notEmpty();
            req.assert('zoneCode', 'You must enter zone code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            zone.save(function (err,items) {
            	 if (err) {
                     switch (err.code) {
                         case 11000:
                         case 11001:
                         res.status(400).json([{
                             msg: 'Zone name already taken',
                             param: 'zoneName'
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
                 else
                  {  
                     CountryModel.findOne(
                                   { _id: countryId },function (err, countryDocument){
                                     var zoneid=zone._id;
                                    countryDocument.zone.push(zoneid);
                                    countryDocument.save(function (err,items) {
                                        if(err){

                                            console.log(err);
                                        }

                                    });
 
                               }                           
                            ); 
         
            	     res.json(zone);
                  }
             });
        },
        
        /**
         * Update a zone
         */
        update: function (req, res) {
            var zone = req.zone;
            zone = _.extend(zone, req.body);
            
            req.assert('zoneName', 'You must enter a zone name').notEmpty();
            req.assert('zoneCode', 'You must enter zone code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            zone.save(function (err) {
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
                res.json(zone);
            });
        },
        
        /**
         * Delete a zone
         */
        destroy: function (req, res) {
            var zone = req.zone;
            
            zone.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the zone'
                    });
                }

                res.json(zone);
            });
        },
        
        /**
         * Show a zone
         */
        show: function (req, res) {
            res.json(req.zone);
        },
        
        /**
         * List of Zones
         */
        all: function (req, res) {
        	//console.log(req);
        	var countryId = req.params.countryId;
        	ZoneModel.find({country : countryId}).populate('city').exec(function (err, zones) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zones'
                    });
                }
                res.json(zones);
            });
        }
        
    };
}