'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash');

var validationCostFn = function(cost, callback) {
    var errors = [];
    var errObj
    if (cost.actual_cost == undefined || cost.actual_cost == '') {
        errObj = {
            param: 'actual_cost',
            msg: 'You must enter actual cost  '
        }
        errors.push(errObj)
    }
    if (cost.task == undefined || cost.task == '') {
        errObj = {
            param: 'task',
            msg: 'You must enter task  '
        }
        errors.push(errObj)
    }
    //TODO: implement later
    // if (cost.currency == undefined || cost.currency == '') {
    //     errObj = {
    //         param: 'currency',
    //         msg: 'You must enter currency '
    //     }
    //     errors.push(errObj)
    // }
    // if (cost.attach_invoice == undefined || cost.attach_invoice == '') {
    //     errObj = {
    //         param: 'attach_invoice',
    //         msg: 'You must enter attach invoice '
    //     }
    //     errors.push(errObj)
    // }
    if (cost.article == undefined || cost.article == '') {
        errObj = {
            param: 'article',
            msg: 'You must select article '
        }
        errors.push(errObj)
    }
    if (errors.length) {
        callback(errors, null);
    } else {
        cost.save(function(err) {
            if (err) {
                switch (err.code) {
                    default: var modelErrors = [];
                    if (err.errors) {
                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }
                        callback(modelErrors, null);
                    }
                }
            } else {
                callback(null, cost);
            }
        });
    }
};

module.exports = function(Cost) {

    return {

        /**
         * Find cost by id
         */
        cost: function(req, res, next, id) {
            require('../models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            CostModel.load(id, function(err, cost) {
                if (err) {
                    return next(err);
                }
                if (!cost) {
                    return next(new Error('Failed to load cost ' + id));
                }
                req.cost = cost;
                next();
            });
        },

        validationCost: function(newcostObj, callback) {
            validationCostFn(newcostObj, callback);
        },

        /**
         * Create cost 
         */
        create: function(req, res) {
            require('../models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            require('../models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company;
            var costObj = new CostModel(req.body);
            validationCostFn(costObj, function(error, cost) {
                if (error) {
                    return res.status(400).send(error)
                } else {
                    cost = cost.toJSON();
                    SubTaskModel.findOne({_id:cost.task}, function(err, subTask) {
                        if (err){
                            //TODO: have to add logger
                            console.log(err);
                        }
                        cost.task = subTask;
                        res.json(cost);
                    })
                }
            });
        },

        /**
         * Delete a cost
         */
        delete: function(req, res) {
            var cost = req.cost;
            cost.remove(function(err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the cost'
                    });
                }
                res.json(cost);
            });
        },
        /**
         * fetch totalcost
         */
        totalCost: function(req, res) {
            require('../models/cost')(req.companyDb);
            var CostModel = req.companyDb.model('Cost');
            CostModel.find(function(err, costs) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the cost'
                    });
                }
                var totalCost = 0;
                async.eachSeries(costs, function(cost, callback) {
                    totalCost = cost.actual_cost + totalCost;
                    callback();
                }, function(err) {
                    res.json(totalCost);
                });
            });
        },
    };
}
