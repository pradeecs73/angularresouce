'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   UserCounsellingModel = mongoose.model('UserCounselling'),
	UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (UserCounselling) {

    return {

        /**
         * Find course by id
         */
    	userCounselling: function (req, res, next, id) {
    		UserCounsellingModel.load(id, function (err, userCounselling) {
                if (err) return next(err);
                if (!userCounselling) return next(new Error('Failed to load UserCounselling ' + id));
                req.userCounselling = userCounselling;
                next();
            });
        },
        user: function (req, res, next, id) {
    		UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },
         
        /**
         * Create an course
         */
        create: function (req, res) {
            var userCounselling = new UserCounsellingModel(req.body);
            userCounselling.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Update an UserCounselling
         */
        update: function (req, res) {
            var userCounselling = req.userCounselling;
            userCounselling = _.extend(userCounselling, req.body);
            userCounselling.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Delete a UserCounselling
         */
        destroy: function (req, res) {
            var userCounselling = req.userCounselling;
            
            userCounselling.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Show an UserCounselling
         */
        show: function (req, res) {
            res.json(req.userCounselling);
        },
        
        /**
         * List of UserCounselling
         */
        all: function (req, res) {
        	UserCounsellingModel.find().exec(function (err, UserCounsellings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the UserCounsellings'
                    });
                }

                res.json(UserCounsellings);
            });
        }
        
    };
}