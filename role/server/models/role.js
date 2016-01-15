'use strict';
// require('custom/role/server/models/feature.js');
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    var deepPopulate = require('mongoose-deep-populate')(mongoose);

/*
 * var validateUniqueRoleName = function(value, callback) { var Role =
 * mongoose.model('Role'); Role.find({ $and: [{ name: { $regex: new RegExp('/^' +
 * value + '$/', "i") } }, { _id: { $ne: this._id } }] }, function(err, role) {
 * callback(err || role.length === 0); }); };
 * 
 * var validateUniqueRoleCode = function(value, callback) { var Role =
 * mongoose.model('Role'); Role.find({ $and: [{ roleCode: { $regex: new
 * RegExp('/^' + value +'$/', "i") } }, { _id: { $ne: this._id } }] },
 * function(err, role) { callback(err || role.length === 0); }); };
 */

/**
 * ConfigType Schema.
 */
var RoleSchema = new Schema({
 

    name: {
        type: String,
        default: '',
        trim: true,
        required: true,
        unique:true
        // validate:[validateUniqueRoleName,'Name already exists']
    },
    
    roleCode: {
    	type: String,
    	default: '',
    	trim: true,	
      required: true,
      unique:true,
      // validate:[validateUniqueRoleCode,'Role Code already exists']
    },
    
    description: {
        type: String,
        default: '',
        trim: true,
        required: true
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


RoleSchema.plugin(deepPopulate, {whitelist: [
    'features.feature'
]});




RoleSchema.statics.load = function (id, callback) {
	// Perform database query that calls callback when it's done
	
    this.findOne({
        _id: id
    }).populate('featurerole', 'feature').deepPopulate('featurerole.feature', 'name').exec(callback);
};
mongoose.model('Role', RoleSchema);