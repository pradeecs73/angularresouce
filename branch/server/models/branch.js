'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueBranchName = function(value, callback) {
	  var Branch = mongoose.model('Branch');
	  Branch.find({
	    $and: [{
	      branchName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, country) {
	    callback(err || country.length === 0);
	  });
	};
	
	var validateUniqueBranchCode = function(value, callback) {
		  var Branch = mongoose.model('Branch');
		  Branch.find({
		    $and: [{
		    	branchCode: { $regex : new RegExp(value, "i") }
		    }, {
		      _id: {
		        $ne: this._id
		      }
		    }]
		  }, function(err, branch) {
		    callback(err || branch.length === 0);
		  });
		};

/**
 * Branch Schema.
 */
var BranchSchema = new Schema({
	city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
    branchName: {
        type: String,
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueBranchName,'Branch already exists']
    },
    branchCode: {
        type: String,
	    trim: true,
	    required: true,
        unique:true,
        validate:[validateUniqueBranchCode,'Branch code already exists']
	},
	address: {
        type: Object
	},
	description: {
        type: String,
	    default: '',
	    trim: true
	},
	picture: {
        type: String,
	    default: '',
	    trim: true
	},
	isActive: {
		type: Boolean,
    	default: false
	},
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    email: {
    	type:String ,
    	default: '',
    	trim:true
    },
    
    PhoneNumber :{
    	type:Object
    },
    
    ltd:{
    	type:String
    },
    
    latd:{
    	type:String
    }
         

});


/**
 * Statics
 */
BranchSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};


mongoose.model('Branch', BranchSchema);
