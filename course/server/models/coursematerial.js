'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	
/**
 * Course Material Schema.
 */
var CoursematerialSchema = new Schema({
	parentId: {
		type: Schema.ObjectId,
		ref: 'Coursematerial'
	},
	name: {
		type:String,
	    default: '',
        trim: true
	},
	description: {
        type: String,
        default: '',
        trim: true
    },
	pageStart: {
        type: Number,
        default: '',
        trim: true
    },
    pageEnd: {
        type: Number,
        default: '',
        trim: true
    },
    pages: [{
    	type: Schema.ObjectId,
		ref: 'CoursematerialPage'
    }],
    level: {
        type: String,
        default: '',
        trim: true
    },
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
CoursematerialSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Coursematerial', CoursematerialSchema);