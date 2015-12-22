'use strict';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueCountryName = function(value, callback) {
	  var Country = mongoose.model('Country');
	  Country.find({
	    $and: [{
	      countryName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, country) {
	    callback(err || country.length === 0);
	  });
	};

	var validateUniqueCountryCode = function(value, callback) {
		  var Country = mongoose.model('Country');
		  Country.find({
		    $and: [{
		    	countryCode: { $regex : new RegExp(value, "i") }
		    }, {
		      _id: {
		        $ne: this._id
		      }
		    }]
		  }, function(err, country) {
		    callback(err || country.length === 0);
		  });
		};

/**
 * Country Schema.
 */
var CountrySchema = new Schema({
    countryName: {
        type: String,
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueCountryName,'Country already exists']
    },
    countryCode: {
        type: String,	  
	    trim: true,
	    required: true,
        unique:true,
        validate:[validateUniqueCountryCode,'Country code already exists']
	},
	currency: {
        type: String,
	    trim: true,
	    required: true
	},
	languageName: {
        type: String,
	    trim: true,
	    required: true
	},
	languageCode: {
        type: String,
	    trim: true,
	    required: true
	},
	zone: [{
        type: Schema.ObjectId,
        ref: 'Zone'
    }],
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
CountrySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
/*
CountrySchema.statics.loadByName = function (name, callback) {
    this.findOne({
    	countryName: name
    }).exec(callback);
};

CountrySchema.statics.loadByCountryCode = function (code, callback) {
    this.findOne({
    	countryCode: code
    }).exec(callback);
};
*/
mongoose.model('Country', CountrySchema);
