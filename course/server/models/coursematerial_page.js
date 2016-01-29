'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	
/**
 * Course Material Page Schema.
 */
var CoursematerialPageSchema = new Schema({
	pageNo: {
        type: Number,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    notes: {
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
CoursematerialPageSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('CoursematerialPage', CoursematerialPageSchema);