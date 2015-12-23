'use strict';
/**
 * Module dependencies.
 */
require('../../../../custom/skill/server/models/skill.js');

var utility = require('../../../../core/system/server/controllers/util.js');

var mongoose = require('mongoose'),
    SkillModel = mongoose.model('Skill'),
    _ = require('lodash');
module.exports = function(SkillCtrl) {
    return {
        /**
         * Find skill by id
         */
        skill: function(req, res, next, id) {
            SkillModel.load(id, function(err, skill) {
                if (err) {
                    return next(err);
                }
                if (!skill) {
                    return next(new Error('Failed to load skill ' + id));
                }
                req.skill = skill;
                next();
            });
        },
        /**
         * Create an skill
         */
        create: function(req, res) {
            console.log(req.body);
            var skillData = req.body;
            req.assert('name', 'Please enter Skill name').notEmpty();
            req.assert('description', 'You must enter Skill description').notEmpty();
            req.assert('keywords', 'You must enter Skill keywords').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            skillData.normalizedName = skillData.name.replace(/\s/g, "").toLowerCase();
            var skill = new SkillModel(skillData);
            console.log(skill);
            skill.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Skill already exists',
                                param: 'name'
                            }]);
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
                            }
                    }
                    return res.status(400);
                }
                res.json(skill);
            });
        },
        /**
         * Update an skill
         */
        update: function(req, res) {
            var skill = req.skill;
            skill = _.extend(skill, req.body);
            req.assert('name', 'Please enter Skill name').notEmpty();
            req.assert('description', 'You must enter Skill description').notEmpty();
            req.assert('keywords', 'You must enter Skill keywords').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            skill.normalizedName = req.body.name.replace(/\s/g, "").toLowerCase();
            console.log(skill);
            skill.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Skill already exists',
                                param: 'name'
                            }]);
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
                            }
                    }
                    return res.status(400);
                }
                res.json(skill);
            });
        },
        /**
         * Delete a skill
         */
        destroy: function(req, res) {
            var skill = req.skill;
            skill.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the skill'
                    });
                }
                res.json(skill);
            });
        },
        /**
         * Show an skill
         */
        show: function(req, res) {
            res.json(req.skill);
        },
        /**
         * List of skills
         */
        all: function(req, res) {
            SkillModel.find().exec(function(err, skills) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the skills'
                    });
                }
                res.json(skills);
            });
        },
        
        /**
         * List of skill as by pagination
         */
		skillListByPagination: function (req, res) {
           var populateObj = {};
           utility.pagination(req, res, SkillModel, {}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                   //res.json(result);
               }
               
               return res.json(result);
           });
       },
        
    };
}