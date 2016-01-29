'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var PaymentSchemeSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
	cost: {
		type: Number
	},
	installments: [{
		paymentFor : String,
		installmentAmount : Number,
		fineAmount : Number,
		dueDate : Number,
		isDownPayment: Boolean,
		isLoan : Boolean,
		loanId : {
			type: Schema.ObjectId,
			ref: 'Loan'
		},
		discounts: [{
			marks_form: Number,
			marks_to: Number,
			rate: Number
		}]
	}],
	branches: [{
		type: Schema.ObjectId,
		ref: 'Branch'
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


PaymentSchemeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('skill', 'name description').populate('course', 'name description').exec(callback);
};


mongoose.model('PaymentScheme', PaymentSchemeSchema);