'use strict';
/*
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Building Schema>
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * ConfigType Schema.
 */
var BuildingSchema = new Schema({
    building_name: {
        type: String,
        trim: true,
        required: true,
    },
    address_line_1: {
        type: String,
        trim: true
    },
    address_line_2: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    zipcode: {
        type: String,
        trim: true
    },
    contact_number: {
        type: String,
        trim: true
    },
    square_feet: {
        type: Number
    },
    company: {
        type: Schema.ObjectId
    },
    location: {
        type: Schema.ObjectId
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.ObjectId
    },
    updatedBy: {
        type: Schema.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    loc: {
        type: [Number]
    }
});

/**
 * Enabling soft delete
 */
BuildingSchema.plugin(softremove);

BuildingSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('Building', BuildingSchema);
};