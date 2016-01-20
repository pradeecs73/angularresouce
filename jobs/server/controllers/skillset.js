require('../../../../custom/skill/server/models/skill.js');
require('../../../../custom/skill/server/models/skillkeywords.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose');
var jobModel = mongoose.model('job');
var skillModel = mongoose.model('Skill');
var http = require('http');
var querystring = require('querystring');
var requestify = require('requestify');
var async = require('async');
var SkillkeywordsModel = mongoose.model('Skillkeyword');
var Sites = mongoose.model('Site');
var _ = require('lodash');
var usermodel = mongoose.model('User');
var nodemailer = require('nodemailer');
var config = require('meanio').loadConfig();
var skillsetModel = mongoose.model('skillset');
module.exports = function(Jobs, app) {
    return {
        skillset: function(req, res, next, id) {
            skillsetModel.load(id, function(err, skillset) {
                if (err) {
                    return next(err);
                }
                if (!skillset) {
                    return next(new Error('Failed to load skillset ' + id));
                }
                req.skillset = skillset;
                next();
            });
        },
        create: function(req, res) {
            var skillsetcreate = new skillsetModel(req.body);
            skillsetcreate.save(function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                }
            });
        },
        fetchallskillset: function(req, res) {
            var populateObj = {};
            utility.pagination(req, res, skillsetModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        skillsetdelete: function(req, res) {
         var skillset = req.skillset;

         skillset.remove(function(err,deletedskillset) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the skillset'
                    });
                }
                else{ 
                    res.send(deletedskillset);
                }
               
            });


        }
    }
};