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
module.exports = function(Jobs, app) {
    return {
        job: function(req, res, next, id) {
            jobModel.load(id, function(err, job) {
                if (err) {
                    return next(err);
                }
                if (!job) {
                    return next(new Error('Failed to load job ' + id));
                }
                req.job = job;
                next();
            });
        },
        /*adding a jobs*/
        addjobs: function(req, res) {
            var jobdetails = {
                "version": "prod",
                "appSecret": "aadbf17d60349677e92bff2b3e54f062",
                "siteId": "5hIsdUH75676udp3N8HW32473huyfUHJ",
                "username": {
                    "field": "email",
                    "value": "rodi@streetwisemail.com"
                },
                "password": {
                    "field": "password",
                    "value": "getweb999"
                },
                "fetchPeriod": "day"
            };
            requestify.post('http://job.coderstrust.idc.tarento.com/getAllJobs.py', jobdetails).then(function(response) {
                var errorFound = false;
                fetchedJobs = response.getBody();
                async.each(fetchedJobs, function(fetchedJob, callback) {
                    var myjobs = new jobModel(fetchedJob);
                    myjobs.skillsCT = [];
                    async.series([
                        function(callback) {
                            var fetchedSkills = fetchedJob.skills;
                            async.each(fetchedSkills, function(skillName, callback) {
                                skillModel.loadByNormalizedName(skillName, function(err, skill) {
                                    if (!skill) {
                                        var newSkillData = {}
                                        newSkillData.name = skillName;
                                        newSkillData.normalizedName = skillName.replace(/\s/g, "").toLowerCase();
                                        newSkillData.description = skillName + " <Added by Jobs API Call>";
                                        var newSkill = new skillModel(newSkillData);
                                        newSkill.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                                errorFound = true;
                                            }
                                        });
                                        myjobs.skillsCT.push(newSkill);
                                    } else {
                                        myjobs.skillsCT.push(skill);
                                    }
                                    myjobs.save(function(err, items) {
                                        if (err) {
                                            console.log(err);
                                            errorFound = true;
                                        }
                                    });
                                });
                            });
                            callback();
                        },
                        function(callback) {
                            //analyzing job description
                            var fetcheddescription = fetchedJob.description;
                            fetcheddescription = fetcheddescription.replace(/[^a-zA-Z ]/g, "").toLowerCase();
                            var mydescriptionarray = fetcheddescription.split(" ");
                            async.each(mydescriptionarray, function(descriptionKeyword, callback) {
                                SkillkeywordsModel.findOne({
                                    'normalizedKeyword': descriptionKeyword
                                }, function(err, skillKeyword) {
                                    if (skillKeyword) {
                                        myjobs.skillsCT.push(skillKeyword.skillId);
                                    }
                                });
                            });
                            callback();
                        }
                    ], function(err) {
                        if (err) return next(err);
                    });
                });
                if (errorFound == true) {
                    return res.status(500).json({
                        error: 'Errors were encountered while saving the jobs.'
                    });
                } else {
                    return res.sendStatus(200);
                }
            });
        },
        /*Retreiving all jobs */
        displayjobs: function(req, res) {
            jobModel.find({}, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                }
            });
        },
        /*Retreiving particular job */
        singlejobdetail: function(req, res) {
            res.send(req.job);
        },
        /*Pagination */
        jobListByPagination: function(req, res) {
            if (req.query.filterinput && JSON.parse(req.query.filterinput).filteredarray.length > 0) {
                var skillarray = JSON.parse(req.query.filterinput);
                var queryAnd=[];
                skillarray = skillarray.filteredarray;
                for (var i = 0; i < skillarray.length; i++) {
            		var obj = {
            			'skillsCT': skillarray[i]
            		};
            		queryAnd.push(obj);
            	}

                var populateObj = {};
                utility.pagination(req, res, jobModel, {
                        $and: queryAnd 
                }, {}, populateObj, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.pagination(req, res, jobModel, {}, {}, populateObj, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            }
        },
        recommendedjobListByPagination: function(req, res) {
            var skills = req.user.skills;
            if (req.query.filterinput) {
                var queryIn = JSON.parse(req.query.filterinput);
                queryIn = queryIn.filteredarray;
                var populateObj = {};
                utility.pagination(req, res, jobModel, {
                    skillsCT: {
                        $in: queryIn
                    }
                }, {}, populateObj, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.pagination(req, res, jobModel, {
                    skillsCT: {
                        $in: skills
                    }
                }, {}, populateObj, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            }
        },
        listingloginuserskills: function(req, res) {
            var skills = req.user.skills;
            skillModel.find({
                _id: {
                    $in: skills
                }
            }, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                }
            });
        }
    }
};