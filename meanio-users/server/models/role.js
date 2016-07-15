'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Unique Field Validations.
 */
var validateUniqueName = function(value, callback) {
    var Dashboard = mongoose.model('Dashboard');
    Dashboard.find({
        $and: [{
            name: {
                $regex: new RegExp(value, "i")
            }

        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, dashboard) {
        callback(err || dashboard.length === 0);
    });
};

/**
 * ConfigType Schema.
 */
var RoleSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },

    description: {
        type: String,
        trim: true
    },

    permissions: {},

    dashboard: [{
        type: Schema.ObjectId,
        ref: 'Dashboard'
    }],

    isActive: {
        type: Boolean,
        default: false
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    pristine: {
        type: Boolean,
        default: false
    }

});

/**
 * Statics
 */
RoleSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('feature', 'name').populate('dashboard', 'name').exec(callback);
};
mongoose.model('Role', RoleSchema);