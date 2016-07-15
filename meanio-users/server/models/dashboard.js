'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * ConfigType Schema.
 */
var DashboardSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},

	description: {
		type: String,
		trim: true,
		required: true
	},

	dimension: {
		type: String,
		trim: true,
		required: true
	}

});

/**
 * Statics
 */
DashboardSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};
mongoose.model('Dashboard', DashboardSchema);