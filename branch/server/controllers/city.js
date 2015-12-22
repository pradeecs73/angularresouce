'use strict';

/**
 * Module dependencies.
 */

require('../models/zone.js');

var mongoose = require('mongoose'),
	CityModel = mongoose.model('City'),
	ZoneModel = mongoose.model('Zone'),
    _ = require('lodash');

module.exports = function (City) {

    return {

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
         * Find city by id
         */
        city: function (req, res, next, id) {
        	CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
        },
        
        /**
         * Create a city
         */
        create: function (req, res) {
            var city = new CityModel(req.body);
            city.zone = new ZoneModel(req.zone);
            var zoneId=req.body.zoneId;
            req.assert('cityName', 'You must enter a city name').notEmpty();
            req.assert('cityCode', 'You must enter city code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            city.save(function (err) {
            	 if (err) {
                     switch (err.code) {
                         case 11000:
                         case 11001:
                         res.status(400).json([{
                             msg: 'city name already taken',
                             param: 'cityName'
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

                  ZoneModel.findOne(
                                   { _id: zoneId },function (err, zoneDocument){
                                     var cityid=city._id;
                                    zoneDocument.city.push(cityid);
                                    zoneDocument.save(function (err,items) {
                                        if(err){

                                            console.log(err);
                                        }

                                    });
 
                               }                           
                            );  
                         
            	 res.json(city);
                }
            });
        },
        
        /**
         * Update a city
         */
        update: function (req, res) {
            var city = req.city;
            city = _.extend(city, req.body);
            
            req.assert('cityName', 'You must enter a city name').notEmpty();
            req.assert('cityCode', 'You must enter city code').notEmpty();
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            city.save(function (err) {
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

                res.json(city);
            });
        },
        
        /**
         * Delete a city
         */
        destroy: function (req, res) {
            var city = req.city;
            
            city.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the city'
                    });
                }

                res.json(city);
            });
        },
        
        /**
         * Show an city
         */
        show: function (req, res) {
            res.json(req.city);
        },
        
        /**
         * List of Cities
         */
        all: function (req, res) {
        	var zoneId = req.zone._id;
        	CityModel.find({zone : zoneId}).populate('branch').exec(function (err, cities) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the cities'
                    });
                }

                res.json(cities);
            });
        }
        
    };
}