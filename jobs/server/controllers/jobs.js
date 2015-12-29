require('../../../../custom/skill/server/models/skill.js');
var mongoose = require('mongoose');
var jobModel = mongoose.model('job');
var skillModel = mongoose.model('Skill')
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

     var myjobdetails={
                "status" : "Open",
                "description" : "hi ,i want to magento install my server . neeed this work in one day ret.",
                "title" : "urgently magento 2.0 install my server",
                "jobUrl" : "http://www.truelancer.com/freelance-project/urgently-magento-20-install-my-server-14688frtgret",
                "jobId" : "14688456546",
                "cost" : "5000345346",
                "duration" : "N/A",
                "proposalCount" : "8",
                "costCurrency" : "INR",
                "postedDate" : "2015-12-18",
                "skills" : [ 
                    "hybernet"
                ]
              };

            var str = "AngularJs is. a uI, deVeloper's language.";
                str=str.replace(/[^a-zA-Z ]/g, "").toLowerCase();
            var myarray=str.split(" ");    
  
                 for (var j=0;j<myarray.length;j++)
                 {
                       SkillkeywordsModel.findOne({'normalizedKeyword': myarray[j]}, function(err, skillKeyword) {
                                if(skillKeyword) {
                                    var myjobs = new jobModel(myjobdetails);
                                        myjobs.skillsCT.push(skillKeyword.skillId);
                                     myjobs.save(function(err, items) {
                                        if (err) {
                                            console.log(err);
                                            errorFound = true;
                                        }
                                    });                             
                                }
                          });
                  
                 }
               
               res.send(200);

          /*requestify.post('http://coderstrust.job.idc.tarento.com/getAllJobs.py', jobdetails).then(function(response) {
                var errorFound = false;
                fetchedJobs = response.getBody();
                // for (var i = 0; i < fetchedJobs.length; i++) {
                async.each(fetchedJobs, function(fetchedJob, callback) {
                    var myjobs = new jobModel(fetchedJob);
                    myjobs.save(function(err, items) {
                        if (err) {
                            console.log(err);
                            errorFound = true;
                        }
                    });
                    myjobs.skillsCT = [];
                    fetchedSkills = fetchedJob.skills;
                    console.log(fetchedSkills);
                    // for (var j = 0; j < fetchedSkills.length; j++) {
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
                                console.log(newSkill);
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
                });
                // }
                //}
                if (errorFound == true) {
                    return res.status(500).json({
                        error: 'Errors were encountered while saving the jobs.'
                    });
                } else {
                    return res.sendStatus(200);
                }
            });*/
        },
        displayjobs: function(req, res) {
            jobModel.find({}, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                    }

              });
      },

      singlejobdetail: function(req, res) {
        res.send(req.job);
      }

	}
};