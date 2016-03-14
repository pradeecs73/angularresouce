'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var LoanproductSchema = new Schema({
	payment_for: {
		type: String
	},
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
	country: {
		type: Schema.ObjectId,
		ref: 'Country'
	},
	branch: {
		type: Schema.ObjectId,
		ref: 'Branch'
	},
	interestRatePerPeriod: {
		type: String
	},
	numberOfRepayments: {
        type:String
	},
	loan_amount: {
		type: Number
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


LoanproductSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('PaymentScheme').exec(callback);
};


mongoose.model('Loanproduct', LoanproductSchema);