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
//Get all Jobs
var getAllJobs = function(sitedetails) {
    var urlpath = sitedetails.getAllJobsAPIendpoint;
    var urlhost = sitedetails.apiUrl;
    var options = {
        path: urlpath,
        method: 'POST',
        port: 80,
        host: urlhost
    };
    var jobdetails = {
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
            var myjobssite = [];
            async.waterfall([
                function(done) {
                    Sites.find({
                        'enabled': true
                    }, function(err, jobarray) {
                        myjobssite = jobarray;
                        done(err, myjobssite);
                    });
                },
                function(myjobssite, done) {
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
            ], function(err) {});
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
                }, {}, populateObj, {
                    createdAt: -1
                }, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.paginationsort(req, res, jobModel, {}, {}, populateObj, {
                    createdAt: -1
                }, function(result) {
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
                }, {}, populateObj, {
                    createdAt: -1
                }, function(result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }
                    return res.json(result);
                });
            } else {
                var populateObj = {};
                utility.paginationsort(req, res, jobModel, {
                    skillsCT: {
                        $in: skills
                    }
                }, {}, populateObj, {
                    createdAt: -1
                }, function(result) {
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
        },
        emailtriggerformatchedjobs: function(req, res) {
            usermodel.find(function(err, users) {
                if (err) {
                    console.log(err);
                } else {
                    async.each(users, function(userobject, callback) {
                        emailjobsforuser(userobject.skills, userobject.email, userobject.name);
                        callback();
                    });
                    res.send(200);
                }
            });
        },
        forecastingjobsemailtrigger: function(req, res) {
            var myskillsetdata = [];
            async.waterfall([
                function(done) {
                    skillsetModel.find(function(err, skills) {
                        if (err) {
                            console.log(err);
                        } else {
                            myskillsetdata = skills;
                            done(err, myskillsetdata);
                        }
                    });
                },
                function(myskillsetdata, done) {
                usermodel.find(function(err, users) {
                    if (err) {
                        console.log(err);
                    } else {
                        async.each(users, function(userobject, callback) {
                            emailforforecastingjobs(userobject.skills,myskillsetdata,userobject.email, userobject.name);
                            callback();
                        });
                    }
                });
                    done();
                },
                function(done) {
                    return res.sendStatus(200);
                    done();
                }
            ], function(err) {});
           
        }
    }
};

function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
};
var emailjobsforuser = function(skillarray, useremail, username) {
    var mailOptions = {
        from: config.emailFromWelcome,
        createTextFromHtml: true,
        subject: 'CodersTrust matching jobs'
    };
    mailOptions.to = useremail;
    jobModel.find({
        skillsCT: {
            $in: skillarray
        }
    }, function(err, jobs) {
        if (err) {
            console.log(err);
        } else {
            var jobslist = ['Dear <b>' + username + '</b>Job Matching For Your Skills'];
            for (var i = 0; i < jobs.length; i++) {
                jobslist.push(jobs[i].title);
            }
            mailOptions.html = jobslist.join('<br><br>');
            sendMail(mailOptions);
        }
    });
};
var emailforforecastingjobs = function(userskillarray,myskillsetdata,useremail,username) {
    var useremail=useremail;
    var username=username;

    async.each(myskillsetdata, function(skilldata, callback) {
       var mymainarray=_.pluck(skilldata.skill, "skillid");
           mymainarray=mymainarray.join(',').split(',');

        for(var i=0;i<skilldata.skill.length;i++)
        {
            if(skilldata.skill[i].main)
               {
                 var skillsetskill=skilldata.skill[i].skillid;
                 if(userskillarray.indexOf(skillsetskill) >= 0)
                 {

                       var resultarray=[];
                     for(var j = 0; j < mymainarray.length; j++) {
                              if (userskillarray.indexOf(mymainarray[j]) == -1)
                                  resultarray.push(mymainarray[j]);      
                           }
                        sendmailtouser(resultarray,useremail,username);

                 }

               } 

        }
    
        callback();
     });
};

var sendmailtouser=function(resultarray,useremail,username)
{

    skillModel.find({_id: {$in: resultarray}},function(err, mailskills) {
                if (err) {
                    console.log(err);
                } else {

                    var mailskillsname=_.pluck(mailskills,'name');
                        mailskillsname=mailskillsname.join();
                         var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'CodersTrust matching jobs'
                            };
                               mailOptions.to = useremail;
                               var mailcontent = ['Dear <b>' + username + '</b>you have to learn '+mailskillsname+''];
                               mailOptions.html = mailcontent.join('<br><br>');
                               sendMail(mailOptions);
                }
            });

};