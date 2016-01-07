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
var _ = require('lodash');
//Get all Jobs
var getAllJobs = function(jobdetails, callbackA) {
    var options = {
        path: '/getAllJobs.py',
        method: 'POST',
        port: 80,
        host: 'job.coderstrust.idc.tarento.com'
    };
    var reqs = http.request(options, function(resp) {
        var errorFound = false;
        var output = [];
        resp.on('data', function(chunk) {
            output.push(chunk);
        });
        resp.on('end', function() {
            var data = output.join('');
            fetchedJobs = JSON.parse(data);
            async.series([
                function(callbackB) {
                    async.each(fetchedJobs, function(fetchedJob, callbackC) {
                        var myjobs = new jobModel(fetchedJob);
                        myjobs.skillsCT = [];
                        var fetchedSkills = fetchedJob.skills;
                        async.each(fetchedSkills, function(skillName, callbackD) {
                            errorFound = false;
                            skillFound = false;
                            var newSkillData = {}
                            newSkillData.name = skillName;
                            newSkillData.normalizedName = skillName.replace(/\s/g, "").toLowerCase();
                            newSkillData.description = skillName + " <Added by Jobs API Call>";
                            var newSkill = new skillModel(newSkillData);
                            newSkill.save(function(err) {
                                if (err) {
                                    skillModel.findOne({
                                        'normalizedName': newSkillData.normalizedName
                                    }, function(err, skill) {
                                        if (skill) {
                                            myjobs.skillsCT.push(skill);
                                            // _.uniq(myjobs.skillsCT);
                                            console.log('saving1: [' + myjobs.jobId + ']: ' + myjobs.skillsCT)
                                            myjobs.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                            });
                                        }
                                    });
                                }
                            }).then(function(savedSkill) {
                                myjobs.skillsCT.push(savedSkill);
                                // _.uniq(myjobs.skillsCT);
                                console.log('saving2: [' + myjobs.jobId + ']: ' + myjobs.skillsCT)
                                myjobs.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });
                            callbackD();
                        });
                        callbackC();
                    });
                    callbackB();
                },
                function(callbackE) {
                    //analyzing job description
                    async.each(fetchedJobs, function(fetchedJob, callbackF) {
                        var fetcheddescription = fetchedJob.description;
                        fetcheddescription = fetcheddescription.replace(/[^a-zA-Z ]/g, "").toLowerCase();
                        var mydescriptionarray = fetcheddescription.split(" ");
                        async.each(mydescriptionarray, function(descriptionKeyword, callbackG) {
                            SkillkeywordsModel.findOne({
                                'normalizedKeyword': descriptionKeyword
                            }, function(err, skillKeyword) {
                                if (skillKeyword) {
                                    myjobs.skillsCT.push(skillKeyword.skillId);
                                }
                            });
                            callbackG();
                        });
                        callbackF();
                    });
                    callbackE();
                }
            ], function(err) {
                if (err) {}
                callbackA();
            });
            // return res.sendStatus(200);
        });
    });
    reqs.on('socket', function(socket) {
        socket.setTimeout(0); // no timeout
        socket.on('timeout', function() {
            socket.resume(); // tried resuming the timeout
        });
    });
    reqs.write(JSON.stringify(jobdetails));
    reqs.end();
};
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
            async.series([
                function(callback1) {
                    var jobdetails = {
                        "version": "prod",
                        "appSecret": "aadbf17d60349677e92bff2b3e54f062",
                        "siteId": "5hIsdUH75676udp3N8HW32473huyfUHJ",
                        "username": "rodi@streetwisemail.com",
                        "password": "getweb999",
                        "fetchPeriod": "day"
                    };
                    getAllJobs(jobdetails, function() {
                        console.log('End of Truelancer');
                    });
                    callback1();
                },
                function(callback2) {
                    var jobdetails = {
                        "version": "prod",
                        "appSecret": "aadbf17d60349677e92bff2b3e54f062",
                        "siteId": "b47e828eb9310894f7ba467e876b2f8d",
                        "username": "rody@binkmail.com",
                        "password": "webget999",
                        "fetchPeriod": "day"
                    };
                    getAllJobs(jobdetails, function() {
                        console.log('End of PPH');
                    });
                    callback2();
                },
                function(callback3) {
                    var jobdetails = {
                        "version": "prod",
                        "appSecret": "aadbf17d60349677e92bff2b3e54f062",
                        "siteId": "53c0f182aeba1bbb2c2e8aa26fc4e2ba",
                        "username": "freds@streetwisemail.com",
                        "password": "webget999",
                        "fetchPeriod": "day"
                    };
                    getAllJobs(jobdetails, function() {
                        console.log('End of Guru');
                    });
                    callback3();
                },
                function(callback4) {
                    return res.sendStatus(200);
                    callback4();
                }
            ], function(err) {
                if (err) {}
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
                var queryAnd = [];
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