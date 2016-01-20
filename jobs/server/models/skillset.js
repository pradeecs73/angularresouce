'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var skillsetSchema = new Schema({
   name: {
        type: String,
        trim: true
    },
    skill:[{
         skillid:{type:Schema.ObjectId,ref:'skill'},
         skilllevel:{type:Number},
         main:{type:Boolean}
    }],
    cost: {
        type: Number,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

skillsetSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('skillset', skillsetSchema);