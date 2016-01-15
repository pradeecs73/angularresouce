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
//Get all Jobs
var getAllJobs = function(sitedetails) {
    var urlpath=sitedetails.getAllJobsAPIendpoint;
    var urlhost=sitedetails.apiUrl;
    var options = {
        path: urlpath,
        method: 'POST',
        port: 80,
        host: urlhost
    };

  var jobdetails={
    "version": "prod",
    "appSecret": sitedetails.apiSecret,
    "siteId": sitedetails.apiSiteId,
    "username": sitedetails.siteUsername,
    "password": sitedetails.sitePassword,
    "fetchPeriod": "day"
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
            currentJob = {};
           async.series([
                function(callbackB) {
                    async.each(fetchedJobs, function(fetchedJob, callbackC) {
                        var myjobs = new jobModel(fetchedJob);
                        myjobs.skillsCT = [];
                        myjobs.save(function(err) {
                            if (err) {
                                console.log(err);
                            }
                        }).then(function(savedJob) {
                            var fetcheddescription = savedJob.description;
                            fetcheddescription = fetcheddescription.replace(/[^a-zA-Z ]/g, "").toLowerCase();
                            var mydescriptionarray = fetcheddescription.split(" ");
                            async.each(mydescriptionarray, function(descriptionKeyword, callbackG) {
                                SkillkeywordsModel.findOne({
                                    'normalizedKeyword': descriptionKeyword
                                }, function(err, skillKeyword) {
                                    if (skillKeyword) {
                                        savedJob.skillsCT.push(skillKeyword.skillId);
                                        savedJob.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    }
                                });
                                callbackG();
                            });
                        });
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
                } 
            ], function(err) {
                if (err) {}
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
            var myjobssite=[];

            async.waterfall([

                    function (done) {

                         Sites.find({'enabled': true}, function(err, jobarray) {
                                   myjobssite=jobarray;  
                                    done(err, myjobssite);
                                });
                    },
                    function (myjobssite, done) { 
                        async.each(myjobssite, function(jobsinputobject, callback) {
                            getAllJobs(jobsinputobject);
                             callback();
                        });
                      done();
                       
                    },
                    function(done) {
                      return res.sendStatus(200);
                       done();
                   }
                ],
                function (err) {

                   
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
                utility.paginationsort(req, res, jobModel, {
                    $and: queryAnd
                }, {}, populateObj,{createdAt:-1}, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.paginationsort(req, res, jobModel, {}, {}, populateObj,{createdAt:-1}, function(result) {
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
                utility.paginationsort(req, res, jobModel, {
                    skillsCT: {
                        $in: queryIn
                    }
                }, {}, populateObj,{createdAt:-1}, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.paginationsort(req, res, jobModel, {skillsCT: { $in: skills } }, {}, populateObj,{createdAt:-1}, function(result) {
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