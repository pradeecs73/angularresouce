'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * validations
 */
var validateUniqueZoneName = function(value, callback) {
	  var Zone = mongoose.model('Zone');
	  Zone.find({
	    $and: [{
	    	zoneName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, zone) {
	    callback(err || zone.length === 0);
	  });
	};

	var validateUniqueZoneCode = function(value, callback) {
		  var Zone = mongoose.model('Zone');
		  Zone.find({
		    $and: [{
		    	zoneCode: { $regex : new RegExp(value, "i") }
		    }, {
		      _id: {
		        $ne: this._id
		      }
		    }]
		  }, function(err, zone) {
		    callback(err || zone.length === 0);
		  });
		};


/**
 * Zone Schema.
 */
var ZoneSchema = new Schema({
	country: {
        type: Schema.ObjectId,
        ref: 'Country'
    },
    zoneName: {
        type: String,
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueZoneName,'Zone already exists']
    },
    zoneCode: {
        type: String,
	    trim: true,
	    required: true,
        unique:true,
        validate:[validateUniqueZoneCode,'Zone code already exists']
	},
	city: [{
        type: Schema.ObjectId,
        ref: 'City'
    }],
    cities: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});


/**
 * Statics
 */
ZoneSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('country','countryName').exec(callback);
};


mongoose.model('Zone', ZoneSchema);
