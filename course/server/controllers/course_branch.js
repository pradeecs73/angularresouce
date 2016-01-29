'use strict';

/**
 * Module dependencies.
 */
require('../../../branch/server/models/branch.js');
require('../../../branch/server/models/city.js');
require('../../../course/server/models/course.js');
require('../../../course/server/models/payment_scheme.js');
require('../../../course/server/models/loan.js');
var async = require('async');

var mongoose = require('mongoose'),
	BranchModel = mongoose.model('Branch'),
	CityModel = mongoose.model('City'),
	CourseModel = mongoose.model('Course'),
	PaymentSchemeModel = mongoose.model('PaymentScheme'),
	LoanModel = mongoose.model('Loan'),
    _ = require('lodash');

module.exports = function (CourseBranch) {

    return {
    	
    	branch: function(req, res, next, id){
    		BranchModel.load(id, function (err, branch) {
                if (err) return next(err);
                if (!branch) return next(new Error('Failed to load branch ' + id));
                req.branch = branch;
                next();
            });
    	},
    	
    	city: function(req, res, next, id){
    		CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
    	},
    	
    	course: function(req, res, next, id){
    		CourseModel.load(id, function (err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
    	},
    	
    	assignCourseToBranch: function(req, res){
    		var courseId = req.params.courseId;
    		var branchId = req.params.branchId;
    		var course = req.course;
    		var coursePaymentSchemes = req.body.coursePaymentSchemes;
        	
			delete req.body.coursePaymentSchemes;
			
            var branch = req.branch;
            branch = _.extend(branch, req.body);
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            console.log(branch);      
            branch.save(function (err) {            	
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                ERRORS.ERROR_001
                            ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            } else {
                            	console.log(err);
                            }
                    }
                    return res.status(400);
                }
            	async.each(coursePaymentSchemes, function(paymentScheme, callback) {
            		var paymentSchemeData = {
            				course : courseId,
            				cost : paymentScheme.cost,
            				installments : []
            		};
            		async.each(paymentScheme.installments, function(installmentObj, callback) {
            			var installment = {
                        	paymentFor : installmentObj.paymentFor,
                        	installmentAmount : installmentObj.installmentAmount,
                        	isLoan : installmentObj.isLoan,
                        	discounts : []
                        };
            			if(installmentObj.paymentFor === 'Down Payment'){
                        	installment.isDownPayment = true;
                        } else {
                        	installment.isDownPayment = false;
                        }
                        if(installmentObj.fineAmount){
                        	installment.fineAmount = installmentObj.fineAmount;
                        }
                        if(installmentObj.dueDate){
                        	installment.dueDate = installmentObj.dueDate;
                        }
                        
                        if(installmentObj.isLoan){
	            			var loanData = {
	                			payment_for: installmentObj.paymentFor,
	                			loan_amount: installmentObj.installmentAmount
	                		}
	            			var loan = new LoanModel(loanData);
	            			installment.loanId = loan._id;
	            			loan.save(function (err) {
	                            if (err) {
	                                console.log("Error : " + err);
	                            }
	                        });
                        }
                        async.each(installmentObj.discounts, function(discount, callback) {
                        	installment.discounts.push(discount);
                        });
                        paymentSchemeData.installments.push(installment);
            		});
            		
                    var paymentSchemeObj = new PaymentSchemeModel(paymentSchemeData);
                    paymentSchemeObj.save(function (err) {
                        if (err) {
                            console.log("Error : " + err);
                        }
                        course.payment_scheme.push(paymentSchemeObj._id);
                        course.save(function (err) {
                            if (err) {
                                console.log("Error : " + err);
                            }
                    	});
                    });
                });
            	
            	res.json(branch);
            });
        },
        
        assignCourseToMultipleBranch: function(req, res){
    		var courseId = req.params.courseId;
    		var cityId = req.params.cityId;
    		var course = req.course;
    		var coursePaymentSchemes = req.body.coursePaymentSchemes;
        	
			delete req.body.coursePaymentSchemes;
			
            var branch = req.branch;
            branch = _.extend(branch, req.body);
            
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
                       
            branch.save(function (err) {            	
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                ERRORS.ERROR_001
                            ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            } else {
                            	console.log(err);
                            }
                    }
                    return res.status(400);
                }
            	BranchModel.find({city: cityId}).exec(function(err, branches){
            		if(err){
            			console.log(err);
            		}
            	
	            	async.each(coursePaymentSchemes, function(paymentScheme, callback) {
	            		var paymentSchemeData = {
	            				course : courseId,
	            				cost : paymentScheme.cost,
	            				installments : [],
	            				branches: []
	            		};
	            		async.each(branches, function(branch, callback) {
	            			paymentSchemeData.branches.push(branch._id);
	            		});
	            		async.each(paymentScheme.installments, function(installmentObj, callback) {
	            			var installment = {
	                        	paymentFor : installmentObj.paymentFor,
	                        	installmentAmount : installmentObj.installmentAmount,
	                        	isLoan : installmentObj.isLoan,
	                        	discounts : []
	                        };
	            			if(installmentObj.paymentFor === 'Down Payment'){
	                        	installment.isDownPayment = true;
	                        } else {
	                        	installment.isDownPayment = false;
	                        }
	                        if(installmentObj.fineAmount){
	                        	installment.fineAmount = installmentObj.fineAmount;
	                        }
	                        if(installmentObj.dueDate){
	                        	installment.dueDate = installmentObj.dueDate;
	                        }
	                        
	                        if(installmentObj.isLoan){
		            			var loanData = {
		                			payment_for: installmentObj.paymentFor,
		                			loan_amount: installmentObj.installmentAmount
		                		}
		            			var loan = new LoanModel(loanData);
		            			installment.loanId = loan._id;
		            			loan.save(function (err) {
		                            if (err) {
		                                console.log("Error : " + err);
		                            }
		                        });
	                        }
	                        async.each(installmentObj.discounts, function(discount, callback) {
	                        	installment.discounts.push(discount);
	                        });
	                        paymentSchemeData.installments.push(installment);
	            		});
	            		
	                    var paymentSchemeObj = new PaymentSchemeModel(paymentSchemeData);
	                    paymentSchemeObj.save(function (err) {
	                        if (err) {
	                            console.log("Error : " + err);
	                        }
	                        course.payment_scheme.push(paymentSchemeObj._id);
	                        course.save(function (err) {
	                            if (err) {
	                                console.log("Error : " + err);
	                            }
	                    	});
	                    });
	                });
            	});
            	
            	res.json(branch);
            });
        },
        
        removeCourseFromBranch: function(req, res){
        	var courseId = req.params.courseId;
    		var branchId = req.params.branchId;
    		var course = req.course;
    		var branch = req.branch;
        	for(var i = 0; i < branch.course.length; i++){
        		if(JSON.stringify(branch.course[i]._id) === JSON.stringify(courseId)){
        			branch.course.splice(i, 1);
        			break;
        		}
        	}
        	
        	branch.save(function (err) {            	
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                ERRORS.ERROR_001
                            ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            } else {
                            	console.log(err);
                            }
                    }
                    return res.status(400);
                }
            	console.log(branch);
            	async.each(course.payment_scheme, function(paymentSchemeId, callback) {
            		PaymentSchemeModel.findOne({_id: paymentSchemeId}, function(err, paymentScheme) {
            			if (err) {
                            console.log("Error : " + err);
                        }
            			async.each(paymentScheme.installments, function(installment, callback) {
            				LoanModel.remove({_id: installment.loanId}, function(err, removedCount) {
                    			if (err) {
                                    console.log("Error : " + err);
                                }
                    			if(removedCount){
                    				console.log(removedCount + " Loan document removed ");
                    			}
                    		});
            			});
            			PaymentSchemeModel.remove({_id: paymentScheme}, function(err, removedCount) {
                			if (err) {
                                console.log("Error : " + err);
                            }
                			if(removedCount){
                				console.log(removedCount + " Payment Scheme document removed ");
                			}
                		});
            		});
            	});
            	course.payment_scheme = [];
            	course.save(function (err) { 
            		if (err) {
                        console.log("Error : " + err);
                    }
            	});
                res.json(branch);
            });
    	}
    	
    };
}