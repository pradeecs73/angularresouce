'use strict';
/**
 * Module dependencies.
 */
require('../../../search/server/models/search.js');
require('../../../amenity/server/models/amenities.js');
require('../../../amenity/server/models/partOf.js');
require('../../../booking/server/models/booking.js');
require('../../../role/server/models/role.js');
require('../../../space_type/server/models/space_types.js');
var mongoose = require('mongoose');
var RoomsSchemaModel = mongoose.model('Rooms');
var Spaces = require('../../../space/server/models/space.js');
var SpaceModel = mongoose.model('Space');
var RoomtypeModel = mongoose.model('Roomstype');
var _ = require('lodash');
var async = require('async');
var AmenityModel = mongoose.model('Amenities');
var PartOfModel = mongoose.model('PartOf');
var ScheduleModel = mongoose.model("Schedule");
var BookingModel = mongoose.model("Booking");
var nodemailer = require('nodemailer');
var templates = require('../template');
var config = require('meanio').loadConfig();
var logger = require('../../../../core/system/server/controllers/logs.js');
var RoleModel = mongoose.model("Role");
 var notify = require('../../../notification/server/controllers/notify.js');
 var UserModel = mongoose.model('User');


function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

module.exports = function(Rooms) {
    return {
        room: function(req, res, next, id) {
            RoomsSchemaModel.load(id, function(err, room) {
                if (err) {
                    return next(err);
                }
                if (!room) {
                    return next(new Error('Failed to load roomdetails ' + id));
                }
                req.room = room;
                next();
            });
        },
         gettingAllRoomsAdmin:function(req,res){

            SpaceModel.find({}).exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all spaces is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all spaces is successful');  
                    res.send(docs);
                }
                     
              });

        },
        gettingroomtypename:function(req,res){
            var roomTypeId=req.query.roomTypeId;
            RoomtypeModel.findOne({"_id":roomTypeId},function(err, item) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(item);
                }
            });
        },

        approveRoom:function(req,res)
        {
           var roomId=req.body.roomId;
           var status=req.body.status;
           RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                if(err)
                {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve room  '+err+'');
                    res.send(400);
                }
                else
                {             
                    item.status=status;
                    item.save(function(err){
                      if(err)
                      {
                         logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve room  '+err+'');
                          res.send(400);
                      }
                      else
                      {
                          logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room approved successfully '); 

                          if(item.status == 'approved' && item.isAdminAdded){
                                    UserModel.findOne({
                                           _id : item.partner
                                        }, function(err, user) {
                                            notify.addNotificationURL('Approved',item.name+' room is approved.',user,'/space/room/list');
                                      });
                          }
                          else
                          {
                            UserModel.findOne({
                                           _id : item.createdBy
                                        }, function(err, user) {
                                            notify.addNotificationURL('Approved',item.name+' room is approved.',user,'/space/room/list');
                                    });
                          }

                          res.send(200);
                      }
                    });
                }

           }); 

        },
        rejectRoom:function(req,res)
        {
           var roomId=req.body.roomId;
           var status=req.body.status;
           RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                if(err)
                {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room status '+err+'');
                    res.send(400);
                }
                else
                {             
                    item.status=status;
                    item.sentToAdminApproval=false;
                    item.isPublished=false;
                    item.save(function(err){
                      if(err)
                      {
                         logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room status '+err+'');
                          res.send(400);
                      }
                      else
                      {          
                          if(item.status == 'pending' && item.isAdminAdded) {
                            UserModel.findOne({
                                           _id : item.createdBy
                                        }, function(err, user) {
                                            notify.addNotificationURL('Not Approved',item.name+' room is not approved. Please update details properly.',user,'/space/room/list');
                                      });
                          }
                          else
                          {
                            UserModel.findOne({
                                           _id : item.partner
                                        }, function(err, user) {
                                            notify.addNotificationURL('Not Approved',item.name+' room is not approved. Please update details properly.',user,'/space/room/list');
                                      });
                          }
                          logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room status updated successfully'); 
                          res.send(200);
                      }
                    });
                }

           }); 

        },
        activateRoom:function(req,res)
        {
           var roomId=req.body._id;
           var roomsschedule = req.body.roomsslotschedule;
           var spaceholiday=req.body.spaceId.space_holiday;
               spaceholiday=_.pluck(spaceholiday,"holiday_date");
           var spaceholidaylist=[];  
               for(var i=0;i<spaceholiday.length;i++){
                 spaceholidaylist.push(spaceholiday[i].substr(0,11));
               }
           var location= req.body.loc;    
           var spaceId = req.body.spaceId._id;

           async.waterfall([
                 function(done){
                      RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                           if(err)
                           {
                             logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to activate the room '+err+'');
                               res.send(400);
                           }
                           else
                           {             
                               item.isActive=true;
                               item.save(function(err){
                                 if(err)
                                 {
                                    logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to activate the room'+err+'');
                                     res.send(400);
                                 }
                                 else
                                 {
                                     logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room is activated successfully'); 
                                     done();
                                 }
                               });
                           }
                      });             
                 },
                 function(done){
                     for (var i = 0; i < 90; i++) {
                         var myday = new Date();
                         var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                         var previousdaycreate=new Date();
    
                        var previousdate=new Date(previousdaycreate.setDate(previousdaycreate.getDate() + (i - 1)));
                            previousdate=previousdate.toISOString();  
                            previousdate=previousdate.substr(0,11);

                        var nextdaycreate=new Date();

                        var nextdate=new Date(nextdaycreate.setDate(nextdaycreate.getDate() + (i + 1)));
                            nextdate=nextdate.toISOString();  
                            nextdate=nextdate.substr(0,11);  

                         var mydaymodified = new Date();

                         var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                             todaydate=todaydate.toISOString();  
                             todaydate=todaydate.substr(0,11);


                         var univarsaldate = new Date();
                         var univarsaldateminute = univarsaldate.getTimezoneOffset();

                         var offsetTimeFromObject=config.zoneOffset.indiaOffset;

                         var checkingcurrentdayisholiday= _.contains(spaceholidaylist, todaydate);

                         var mycurrentday = mycurrentdate.getDay();

                        if (mycurrentday == 0 && roomsschedule[6])
                             {
                               if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                   var  myunivarsalstarttime=roomsschedule[6].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[6].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            
 

                                   var myfinalobj = {};
                                   myfinalobj.room = roomId;
                                   myfinalobj.loc = location;
                                   myfinalobj.day = "Sunday";
                                   myfinalobj.isAllday = roomsschedule[6].isAllday;
                                   myfinalobj.isClosed = roomsschedule[6].isClosed;
                                   myfinalobj.date = mycurrentdate;
                                   myfinalobj.bookings = [];
                                   var myfinalschedule = [];
                                   var startTimeDay = new Date(myfinalscheduleStartTime);
                                   var endTimeDay = new Date(myfinalscheduleEndTime);
                                   startTimeDay.setSeconds(0);
                                   startTimeDay.setMilliseconds(0);
                                   endTimeDay.setSeconds(0);
                                   endTimeDay.setMilliseconds(0);

                                   var myobj = {};
                                   myobj.startTime = startTimeDay;
                                   myobj.endTime = endTimeDay;
                                   myfinalschedule.push(myobj);
                                   myfinalobj.initialAval = myfinalschedule;
                                   myfinalobj.currentAval = myfinalschedule;
                                   myfinalobj.roomType =  req.body.roomtype;
                                   var schedulecreate = new ScheduleModel(myfinalobj);
                                   schedulecreate.save(function(err, items) {
                                       if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                           res.send(400);
                                       }
                                   });
                               }
                            }    

                        if (mycurrentday == 1 && roomsschedule[0])
                         {   
                             if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                               var  myunivarsalstarttime=roomsschedule[0].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[0].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            


                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Monday";
                                 myfinalobj.isAllday = roomsschedule[0].isAllday;
                                 myfinalobj.isClosed = roomsschedule[0].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(myfinalscheduleStartTime);
                                 var endTimeDay = new Date(myfinalscheduleEndTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                           }
                           
                            if (mycurrentday == 2 && roomsschedule[1])
                            { 
                             if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[1].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[1].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            



                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Tuesday";
                                 myfinalobj.isAllday = roomsschedule[1].isAllday;
                                 myfinalobj.isClosed = roomsschedule[1].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(myfinalscheduleStartTime);
                                 var endTimeDay = new Date(myfinalscheduleEndTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0); 

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                           }

                           if (mycurrentday == 3 && roomsschedule[2])
                            {   
                               if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                   var  myunivarsalstarttime=roomsschedule[2].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[2].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            



                                   var myfinalobj = {};
                                   myfinalobj.room = roomId;
                                   myfinalobj.loc = location;
                                   myfinalobj.day = "Wednesday";
                                   myfinalobj.isAllday = roomsschedule[2].isAllday;
                                   myfinalobj.isClosed = roomsschedule[2].isClosed;
                                   myfinalobj.date = mycurrentdate;
                                   myfinalobj.bookings = [];
                                   var myfinalschedule = [];
                                   var startTimeDay = new Date(myfinalscheduleStartTime);
                                   var endTimeDay = new Date(myfinalscheduleEndTime);
                                   startTimeDay.setSeconds(0);
                                   startTimeDay.setMilliseconds(0);
                                   endTimeDay.setSeconds(0);
                                   endTimeDay.setMilliseconds(0);  

                                   var myobj = {};
                                   myobj.startTime = startTimeDay;
                                   myobj.endTime = endTimeDay;
                                   myfinalschedule.push(myobj);
                                   myfinalobj.initialAval = myfinalschedule;
                                   myfinalobj.currentAval = myfinalschedule;
                                   myfinalobj.roomType =  req.body.roomtype;
                                   var schedulecreate = new ScheduleModel(myfinalobj);
                                   schedulecreate.save(function(err, items) {
                                       if (err) {
                                            logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                           res.send(400);
                                       }
                                   });
                               }
                             }
                             
                         if (mycurrentday == 4 && roomsschedule[3])
                         {      
                             if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                    var  myunivarsalstarttime=roomsschedule[3].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[3].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            


                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Thursday";
                                 myfinalobj.isAllday = roomsschedule[3].isAllday;
                                 myfinalobj.isClosed = roomsschedule[3].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(myfinalscheduleStartTime);
                                 var endTimeDay = new Date(myfinalscheduleEndTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                          }     

                         if (mycurrentday == 5 && roomsschedule[4])
                        {  
                           if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                var  myunivarsalstarttime=roomsschedule[4].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[4].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            



                               var myfinalobj = {};
                               myfinalobj.room = roomId;
                               myfinalobj.loc = location;
                               myfinalobj.day = "Friday";
                               myfinalobj.isAllday = roomsschedule[4].isAllday;
                               myfinalobj.isClosed = roomsschedule[4].isClosed;
                               myfinalobj.date = mycurrentdate;
                               myfinalobj.bookings = [];
                               var myfinalschedule = [];
                               var startTimeDay = new Date(myfinalscheduleStartTime);
                               var endTimeDay = new Date(myfinalscheduleEndTime);
                               startTimeDay.setSeconds(0);
                               startTimeDay.setMilliseconds(0);
                               endTimeDay.setSeconds(0);
                               endTimeDay.setMilliseconds(0);

                               var myobj = {};
                               myobj.startTime = startTimeDay;
                               myobj.endTime = endTimeDay;
                               myfinalschedule.push(myobj);
                               myfinalobj.initialAval = myfinalschedule;
                               myfinalobj.currentAval = myfinalschedule;
                               myfinalobj.roomType =  req.body.roomtype;
                               var schedulecreate = new ScheduleModel(myfinalobj);
                               schedulecreate.save(function(err, items) {
                                   if (err) {
                                        logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                       res.send(400);
                                   }
                               });
                           }
                          } 


                        if (mycurrentday == 6 && roomsschedule[5])
                        {  
                             if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                   var  myunivarsalstarttime=roomsschedule[5].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[5].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            


                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Saturday";
                                 myfinalobj.isAllday = roomsschedule[5].isAllday;
                                 myfinalobj.isClosed = roomsschedule[5].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(myfinalscheduleStartTime);
                                 var endTimeDay = new Date(myfinalscheduleEndTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                          } 

                           
                     }
                     done();
                    
                 }
               ], function (err) {
                   res.send(200);
               });
        },
        sendToAdminApproval:function(req,res)
        {
           var roomId=req.body.roomId;
           
            RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                 if(err)
                 {
                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room object '+err+'');
                     res.send(400);
                 }
                 else
                 {             
                     item.sentToAdminApproval=true;
                     item.save(function(err){
                       if(err)
                       {
                          logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room object '+err+'');
                           res.send(400);
                       }
                       else
                       {    
                               RoleModel.findOne({"name":"Admin"},function(err,role){
                                   if(err)
                                   {
                                     logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                   }
                                   else
                                   {
                                       
                                       if(item.spaceId.approveStatus == "approved")
                                         {
                                               UserModel.find({
                                                    role : { "$in" : [role._id] }
                                                 }, function(err, users) {
                                                     async.each(users, function (user, callback) {
                                                     notify.addNotificationURL('Approval',item.name +' room is waiting for your approval in space '+item.spaceId.name,user,'/space/admin/room/detailpage?selectedId='+req.body.roomId);
                                                     callback();
                                                   });
                                               });
                                         } 
                                         else
                                         {
                                               UserModel.find({
                                                  role : { "$in" : [role._id] }
                                               }, function(err, users) {
                                                   async.each(users, function (user, callback) {
                                                   notify.addNotificationURL('Approval',item.spaceId.name +' space is waiting for your approval',user,'/admin/space/'+item.spaceId._id+'/detailpage');
                                                   callback();
                                                 });
                                             });

                                         } 
                                   }
                                 });
                             logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room details updated successfully'); 
                              res.send(200);
                       }
                     });
                 }
            }).populate("spaceId",""); 
        },
       publishRoom:function(req,res)
       {

          var roomId=req.body._id;
          var roomsschedule = req.body.roomsslotschedule;
          var spaceholiday=req.body.spaceId.space_holiday;
              spaceholiday=_.pluck(spaceholiday,"holiday_date");
          var spaceholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spaceholidaylist.push(spaceholiday[i].substr(0,11));
              }
          var location= req.body.loc;    
          var spaceId = req.body.spaceId._id;

          async.waterfall([
                function(done){
                     RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                          if(err)
                          {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to publish the room '+err+'');
                              res.send(400);
                          }
                          else
                          {             
                              item.isPublished=true;
                              item.status="published";
                              item.save(function(err){
                                if(err)
                                {
                                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to publish the room'+err+'');
                                    res.send(400);
                                }
                                else
                                {
                                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room is published successfully'); 
                                    done();
                                }
                              });
                          }
                     });             
                },
                function(done){
                    for (var i = 0; i < 90; i++) {
                        var myday = new Date();
                        var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                        var previousdaycreate=new Date();
    
                        var previousdate=new Date(previousdaycreate.setDate(previousdaycreate.getDate() + (i - 1)));
                            previousdate=previousdate.toISOString();  
                            previousdate=previousdate.substr(0,11);

                        var nextdaycreate=new Date();

                        var nextdate=new Date(nextdaycreate.setDate(nextdaycreate.getDate() + (i + 1)));
                            nextdate=nextdate.toISOString();  
                            nextdate=nextdate.substr(0,11);    

                        var mydaymodified = new Date();

                        var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                            todaydate=todaydate.toISOString();  
                            todaydate=todaydate.substr(0,11);

                         var univarsaldate = new Date();
                         var univarsaldateminute = univarsaldate.getTimezoneOffset();

                         var offsetTimeFromObject=config.zoneOffset.indiaOffset;  
    
                        var checkingcurrentdayisholiday= _.contains(spaceholidaylist, todaydate);

                        var mycurrentday = mycurrentdate.getDay();

                       if (mycurrentday == 0 && roomsschedule[6])
                            {
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

   
                                  var  myunivarsalstarttime=roomsschedule[6].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[6].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                            

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Sunday";
                                  myfinalobj.isAllday = roomsschedule[6].isAllday;
                                  myfinalobj.isClosed = roomsschedule[6].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(myfinalscheduleStartTime);
                                  var endTimeDay = new Date(myfinalscheduleEndTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                           }    

                       if (mycurrentday == 1 && roomsschedule[0])
                        {   
                            if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {


                                  var  myunivarsalstarttime=roomsschedule[0].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[0].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }

                                else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     


                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Monday";
                                myfinalobj.isAllday = roomsschedule[0].isAllday;
                                myfinalobj.isClosed = roomsschedule[0].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }
                          
                           if (mycurrentday == 2 && roomsschedule[1])
                           { 
                            if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                 var  myunivarsalstarttime=roomsschedule[1].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[1].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 } 


                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Tuesday";
                                myfinalobj.isAllday = roomsschedule[1].isAllday;
                                myfinalobj.isClosed = roomsschedule[1].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0); 

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }

                          if (mycurrentday == 3 && roomsschedule[2])
                           {   
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[2].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[2].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 } 

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Wednesday";
                                  myfinalobj.isAllday = roomsschedule[2].isAllday;
                                  myfinalobj.isClosed = roomsschedule[2].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(myfinalscheduleStartTime);
                                  var endTimeDay = new Date(myfinalscheduleEndTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);  

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                            }
                            
                        if (mycurrentday == 4 && roomsschedule[3])
                        {      
                            if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                var  myunivarsalstarttime=roomsschedule[3].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[3].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 } 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Thursday";
                                myfinalobj.isAllday = roomsschedule[3].isAllday;
                                myfinalobj.isClosed = roomsschedule[3].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }     

                        if (mycurrentday == 5 && roomsschedule[4])
                       {  
                          if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                            var  myunivarsalstarttime=roomsschedule[4].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[4].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 } 

                              var myfinalobj = {};
                              myfinalobj.room = roomId;
                              myfinalobj.loc = location;
                              myfinalobj.day = "Friday";
                              myfinalobj.isAllday = roomsschedule[4].isAllday;
                              myfinalobj.isClosed = roomsschedule[4].isClosed;
                              myfinalobj.date = mycurrentdate;
                              myfinalobj.bookings = [];
                              var myfinalschedule = [];
                              var startTimeDay = new Date(myfinalscheduleStartTime);
                              var endTimeDay = new Date(myfinalscheduleEndTime);
                              startTimeDay.setSeconds(0);
                              startTimeDay.setMilliseconds(0);
                              endTimeDay.setSeconds(0);
                              endTimeDay.setMilliseconds(0);

                              var myobj = {};
                              myobj.startTime = startTimeDay;
                              myobj.endTime = endTimeDay;
                              myfinalschedule.push(myobj);
                              myfinalobj.initialAval = myfinalschedule;
                              myfinalobj.currentAval = myfinalschedule;
                              myfinalobj.roomType =  req.body.roomtype;
                              var schedulecreate = new ScheduleModel(myfinalobj);
                              schedulecreate.save(function(err, items) {
                                  if (err) {
                                       logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                      res.send(400);
                                  }
                              });
                          }
                         } 


                       if (mycurrentday == 6 && roomsschedule[5])
                       {  
                            if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                 var  myunivarsalstarttime=roomsschedule[5].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[5].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 } 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Saturday";
                                myfinalobj.isAllday = roomsschedule[5].isAllday;
                                myfinalobj.isClosed = roomsschedule[5].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         } 

                          
                    }
                    done();
                   
                }
              ], function (err) {
                  res.send(200);
              });
                        
       },
        addroomtype: function(req, res) {
            var roomtypecreate = new RoomtypeModel(req.body);
            roomtypecreate.save(function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        },
        loadroomtypes: function(req, res) {
            RoomtypeModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            });
        },
        checkingForAdminLogin:function(req,res){
             RoleModel.findOne({"name":"Admin"},function(err,item){
              if(err)
              {
                logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
              }
              else
              {
                  res.send(item);
              }
             });

        },
        createroom: function(req, res) {

            var roomcreate = new RoomsSchemaModel(req.body);
            var roomsschedule = req.body.roomsslotschedule;
            var spaceholiday=req.body.space_holiday;
                spaceholiday=_.pluck(spaceholiday,"holiday_date");
            var hotdesks = [];
            var capacity = req.body.capacity;
            var spaceholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spaceholidaylist.push(spaceholiday[i].substr(0,11));
              }
            var spaceId = req.body.spaceId;

            async.waterfall([
                function(done) {
                    req.assert('name', 'Please enter room name').notEmpty();
                    req.assert('pricePerhour', 'Please enter price per hour').notEmpty();
                    req.assert('pricePerhalfday', 'Please enter price per halfday').notEmpty();
                    req.assert('pricePerfullday', 'Please enter price per day').notEmpty();
                    req.assert('description', 'Pleas enter room description').notEmpty();
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    } else {
                        done();
                    }
                },
                function(done) {
                	RoomtypeModel.findOne({"_id":req.body.roomtype},function(err, item) {
			            if (err) {
			                res.send(400);
			            } else {
			            	if(item.name.match(/hot/i)) {
			            		req.body.capacity = 1;
			            		for(var i=0; i<capacity; i++) {
			            			hotdesks.push(req.body);
			            		}
			            	}
			            	done();
			            }
			        });
                },
                function(done) {
                	RoomtypeModel.findOne({"_id":req.body.roomtype},function(err, item) {
			            if (err) {
			                res.send(400);
			            } else {
			                if(item.name.match(/hot/i)) {
			                	var index = 1;
			                	async.eachSeries(hotdesks, function(hotdesk, adone) {
			                		delete hotdesk._id;
			                		var room = new RoomsSchemaModel(hotdesk);
			                		room.name += " (#" + index + ')';
			                		index++;
			                		room.save(function(err, item) {
			                			if(err) {
			                            	logger.log('error', 'POST '+req._parsedUrl.pathname+' HotDesk create failed'+err+'');         
			                            	return res.send(400);
			                			} else {
			                				SpaceModel.findOne({"_id": spaceId}, function(err, spaceitem) {
						                        if (err) {
						                            res.send(400);
						                        } else {
						                            spaceitem.rooms.push({
						                                "roomId": item._id,
						                                "status": "active"
						                            });
						                            spaceitem.save(function(err, itemd) {
						                                if (err) {
						                                    res.send(400);
						                                } else {
						                                    //createSchedule(item._id, item.loc, roomsschedule, item.roomtype, adone);
						                                	adone();
						                                }
						                            });
						                        }
						                    });	
			                			}
			                		});
			                	}, function(err) {
			                		if(err) {
			                            logger.log('error', 'POST '+req._parsedUrl.pathname+' HotDesk create failed'+err+'');         
			                            return res.send(500);
			                		} else {
			                            logger.log('info', 'POST '+req._parsedUrl.pathname+' HotDesk created success');
			                			done();
			                		}
			                	});
			                } else {
			                	roomcreate.save(function(err, items) {
			                        if (err) {
			                            logger.log('error', 'POST '+req._parsedUrl.pathname+' Room create failed'+err+'');         
			                            return res.send(400);
			                        } else {
			                            logger.log('info', 'POST '+req._parsedUrl.pathname+' Room created success');
			                            SpaceModel.findOne({
					                        "_id": spaceId
					                    }, function(err, spaceitem) {
					                        if (err) {
					                            res.send(400);
					                        } else {
					                            spaceitem.rooms.push({
					                                "roomId": items._id,
					                                "status": "active"
					                            });
					                            spaceitem.save(function(err, itemd) {
					                                if (err) {
					                                    res.send(400);
					                                } else {
					                                    done();
					                                }
					                            });
					                        }
					                    });
			                        }
			                    });
			                }
			            }
			        });
                }

            ], function(err) {
                res.send(200);
            });
        },
        getAllRooms: function(req, res) {

             RoomsSchemaModel.find({$or:[{"createdBy":req.user._id},{"partner":req.user._id}]}).sort({created:-1}).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });
        },
        deactivateroom: function(req, res) {
            var deleteroom = req.room;
            var roomdeleteId = req.room._id;
            var spaceId = req.room.spaceId._id;
            async.waterfall([
              function(done){
                BookingModel.find({"room":roomdeleteId},function(err,items){
                    if(err)
                    {
                      logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to delete a room '+err+'');
                      res.send(400);
                    }
                    else
                    {
                      done(null,items);
                    }


                });

              },
              function(bookedarray,done){

                if(bookedarray.length > 0)
                {
                   logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Already bookings is their for this room');
                   res.send({
                            "isbooking": true,
                            "bookedarray": bookedarray
                        });
                }
                else
                {
                   logger.log('info', 'DELETE '+req._parsedUrl.pathname+' No bookings is their for this room');
                   done();
                }

              },
                function(done) {
                    RoomsSchemaModel.findOne({"_id":roomdeleteId},function(err, deactivatedroom) {
                        if (err) {
                            logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to load a room '+err+'');
                            return res.status(500).json({
                                error: 'Cannot load the room'
                            });
                        } else {

                            deactivatedroom.isActive=false;
                            deactivatedroom.save(function(err){
                                if(err)
                                {
                                   logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to deactivate a room '+err+'');
                                   res.send(400);
                                }
                                else
                                {
                                  logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Room deactivated sucessfully');
                                   done();
                                }

                            });
                            
                        }
                    });
                },
                function(done)
                {
                  ScheduleModel.remove({"room":roomdeleteId,$softRemove: false},function(err){
                         if(err)
                         {
                           logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Failed to delete the schedule');
                           res.send(400);
                         }
                         else
                         {
                          logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Schedule deleted sucessfully');
                          done();
                         }

                  });
                },
                function(done) {
                    SpaceModel.findOne({
                        "_id": spaceId
                    }, function(err, spaceitem) {
                        if (err) {
                            res.send(400);
                        } else {
                            for (var i = 0; i < spaceitem.rooms.length; i++) {
                                var roomdeleteIdinspace = spaceitem.rooms[i].roomId;
                                if (roomdeleteIdinspace.toString() == roomdeleteId.toString()) {
                                    spaceitem.rooms[i].status = "inactive";
                                    spaceitem.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                                }
                            }
                            done();
                        }
                    });
                }
            ], function(err) {
                res.send(200);
            });
        },
        singleRoomDetail: function(req, res) {
            var roomdetail = req.room; 
            res.send(roomdetail);
        },
        saveEditedRoomDetail: function(req, res) {
            var roomdetail = req.room;        
            var roomslotschedulebefore = req.room.roomsslotschedule;
            var roomslotscheduleafter = req.body.roomsslotschedule;
            var isAdminEdit=req.body.isAdminEdit;
            var editedRoomName=req.body.name;

            var roomId=req.body._id;
            var published=req.body.isPublished;
            var isActive=req.body.isActive;
            var roomsschedule = req.body.roomsslotschedule;
            var spaceholiday=req.body.spaceId.space_holiday;
              spaceholiday=_.pluck(spaceholiday,"holiday_date");
            var spaceholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spaceholidaylist.push(spaceholiday[i].substr(0,11));
              }
           var location= req.body.loc;    
           var spaceId = req.body.spaceId._id;

            var present = [];
            var bookingarray = [];
            roomdetail = _.extend(roomdetail, req.body);
            req.assert('name', 'Please enter room name').notEmpty();
            req.assert('pricePerhour', 'Please enter price per hour').notEmpty();
            req.assert('pricePerhalfday', 'Please enter price per halfday').notEmpty();
            req.assert('pricePerfullday', 'Please enter price per day').notEmpty();
            req.assert('description', 'Pleas enter room description').notEmpty();
            async.waterfall([
                function(done) {
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    } else {
                        done();
                    }
                },
                function(done){
                	if(!isAdminEdit && req.body.isPublished && req.body.amenityEdited)
                	{
                		
	                		RoleModel.findOne({"name":"Admin"},function(err,role){
	                            if(err)
	                            {
	                               res.send(400);	
	                              logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
	                            }
	                            else
	                            {
	                                UserModel.find({
	                                     role : { "$in" : [role._id] }
	                                  }, function(err, users) {
	
	                                      logger.log('info', 'PUT'+req._parsedUrl.pathname+'Sending notification to admin notifying amenity edit'); 
	                                      async.each(users, function (user, callback) {
                                              notify.addNotificationURL('Amenity Update',editedRoomName+' amenity is updated',user,'/space/admin/room/list');                                   
	                                           callback();
	                                    },function(err){
	                                         done();
	                                    });
	                                });
	                            }
	                      });

                	}
                	else
                	{
                		done();
                	}
                },
                function(done) {
                    for (var i = 0; i < roomslotscheduleafter.length; i++) {

                        var editedstarttimennumberbefore=new Date(roomslotschedulebefore[i].startTime);
                        var starttimehoursbefore=editedstarttimennumberbefore.getHours();
                        var starttimeminutesbefore=editedstarttimennumberbefore.getMinutes();
                        var startTimeNumberbefore = starttimehoursbefore*60+starttimeminutesbefore;

                        var editedendtimennumberbefore=new Date(roomslotschedulebefore[i].endTime);
                        var endtimehoursbefore=editedendtimennumberbefore.getHours();
                        var endtimeminutesbefore=editedendtimennumberbefore.getMinutes();
                        var endTimeNumberbefore= endtimehoursbefore*60+endtimeminutesbefore;

                        var editedstarttimennumberafter=new Date(roomslotscheduleafter[i].startTime);
                        var starttimehoursafter=editedstarttimennumberafter.getHours();
                        var starttimeminutesafter=editedstarttimennumberafter.getMinutes();
                        var startTimeNumberafter = starttimehoursafter*60+starttimeminutesafter;

                        var editedendtimennumberafter=new Date(roomslotscheduleafter[i].endTime);
                        var endtimehoursafter=editedendtimennumberafter.getHours();
                        var endtimeminutesafter=editedendtimennumberafter.getMinutes();
                        var endTimeNumberafter= endtimehoursafter*60+endtimeminutesafter;

                        if (startTimeNumberbefore != startTimeNumberafter || endTimeNumberbefore != endTimeNumberafter) {
                            present.push(roomslotscheduleafter[i]);
                        }
                    }
                    done();
                },
                function(done) {
                    async.each(present, function(roomslotobject, callback) {
                      
                        BookingModel.find({
                            'day': roomslotobject.day,
                            "room": req.body._id,
                            $or: [{
                                "bookingStartTimeNumber": {
                                    $lt: roomslotobject.startTimeMinutes
                                }
                            }, {
                                "bookingEndTimeNumber": {
                                    $gt: roomslotobject.endTimeMinutes
                                }
                            }]
                        }, function(err, docs) {
                            if (err) {
                                res.send(400);
                                callback();
                            } else {
                                async.each(docs, function(bookingdoc, callbackbooking) {
                                    bookingarray.push(bookingdoc);
                                    callbackbooking();
                                }, function(err) {
                                    callback();
                                });
                            }
                        });
                    }, function(err) {
                        done();
                    });
                },
                function(done) {
                    if (bookingarray.length > 0) {
                        logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room details ');
                        res.send({
                            "isbooking": true,
                            "bookedarray": bookingarray,
                            "changedschedulearray": present
                        });
                    } else {
                        done();
                    }
                },
                function(done) {
                    roomdetail.save(function(err, items) {
                        if (err) {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room details '+err+'');
                            res.send(err);
                        } else {
                            logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room details updated sucessfully');              
                            done();
                        }
                    });
                },    
                function(done)
                {
                  if(present.length == 0)
                  {
                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' schedule field not edited so schedule not updated'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else if(!published)
                  {
                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' room is not published yet so schedule not created'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else if(!isActive)
                  {
                     logger.log('info', 'PUT '+req._parsedUrl.pathname+' room is not in active so schedule not created'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else
                  {
                    ScheduleModel.remove({"room":roomId,$softRemove: false},function(err, deletedroom) {
                        if (err) {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to delete a schedule '+err+'');
                            return res.status(500).json({
                                error: 'Cannot delete the schedule'
                            });
                        } else {
                            logger.log('info', 'PUT '+req._parsedUrl.pathname+' schedule deleted sucessfully');        
                            done();
                        }
                    });

                  }

                },
                function(done)
                {

                   for (var i = 0; i < 90; i++) {
                        var myday = new Date();
                        var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                        var previousdaycreate=new Date();
    
                        var previousdate=new Date(previousdaycreate.setDate(previousdaycreate.getDate() + (i - 1)));
                            previousdate=previousdate.toISOString();  
                            previousdate=previousdate.substr(0,11);

                        var nextdaycreate=new Date();

                        var nextdate=new Date(nextdaycreate.setDate(nextdaycreate.getDate() + (i + 1)));
                            nextdate=nextdate.toISOString();  
                            nextdate=nextdate.substr(0,11); 

                        var mydaymodified = new Date();

                        var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                            todaydate=todaydate.toISOString();  
                            todaydate=todaydate.substr(0,11);

                         var univarsaldate = new Date();
                         var univarsaldateminute = univarsaldate.getTimezoneOffset();
                        
                         var offsetTimeFromObject=config.zoneOffset.indiaOffset; 

                        var checkingcurrentdayisholiday= _.contains(spaceholidaylist, todaydate);

                        var mycurrentday = mycurrentdate.getDay();

                       if (mycurrentday == 0 && roomsschedule[6])
                            {
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                  
                                  var  myunivarsalstarttime=roomsschedule[6].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[6].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Sunday";
                                  myfinalobj.isAllday = roomsschedule[6].isAllday;
                                  myfinalobj.isClosed = roomsschedule[6].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(myfinalscheduleStartTime);
                                  var endTimeDay = new Date(myfinalscheduleEndTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                           }   

                        if (mycurrentday == 1 && roomsschedule[0])
                        {   
                            if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                              var  myunivarsalstarttime=roomsschedule[0].startTime.substr(11,13); 
                              var  myunivarsalendtime=roomsschedule[0].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }   

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Monday";
                                myfinalobj.isAllday = roomsschedule[0].isAllday;
                                myfinalobj.isClosed = roomsschedule[0].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }
                          
                           if (mycurrentday == 2 && roomsschedule[1])
                           { 
                            if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                var  myunivarsalstarttime=roomsschedule[1].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[1].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     


                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Tuesday";
                                myfinalobj.isAllday = roomsschedule[1].isAllday;
                                myfinalobj.isClosed = roomsschedule[1].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0); 

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }

                          if (mycurrentday == 3 && roomsschedule[2])
                           {   
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {
                
                                   var  myunivarsalstarttime=roomsschedule[2].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[2].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Wednesday";
                                  myfinalobj.isAllday = roomsschedule[2].isAllday;
                                  myfinalobj.isClosed = roomsschedule[2].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(myfinalscheduleStartTime);
                                  var endTimeDay = new Date(myfinalscheduleEndTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);  

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                            }
                            
                        if (mycurrentday == 4 && roomsschedule[3])
                        {      
                            if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[3].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[3].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Thursday";
                                myfinalobj.isAllday = roomsschedule[3].isAllday;
                                myfinalobj.isClosed = roomsschedule[3].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }   

                       if (mycurrentday == 5 && roomsschedule[4])
                       {  
                          if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                              var  myunivarsalstarttime=roomsschedule[4].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[4].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     

                              var myfinalobj = {};
                              myfinalobj.room = roomId;
                              myfinalobj.loc = location;
                              myfinalobj.day = "Friday";
                              myfinalobj.isAllday = roomsschedule[4].isAllday;
                              myfinalobj.isClosed = roomsschedule[4].isClosed;
                              myfinalobj.date = mycurrentdate;
                              myfinalobj.bookings = [];
                              var myfinalschedule = [];
                              var startTimeDay = new Date(myfinalscheduleStartTime);
                              var endTimeDay = new Date(myfinalscheduleEndTime);
                              startTimeDay.setSeconds(0);
                              startTimeDay.setMilliseconds(0);
                              endTimeDay.setSeconds(0);
                              endTimeDay.setMilliseconds(0);

                              var myobj = {};
                              myobj.startTime = startTimeDay;
                              myobj.endTime = endTimeDay;
                              myfinalschedule.push(myobj);
                              myfinalobj.initialAval = myfinalschedule;
                              myfinalobj.currentAval = myfinalschedule;
                              myfinalobj.roomType =  req.body.roomtype;
                              var schedulecreate = new ScheduleModel(myfinalobj);
                              schedulecreate.save(function(err, items) {
                                  if (err) {
                                       logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                      res.send(400);
                                  }
                              });
                          }
                         } 

                       if (mycurrentday == 6 && roomsschedule[5])
                       {  
                            if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                 var  myunivarsalstarttime=roomsschedule[5].startTime.substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[5].endTime.substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + i));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }     

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Saturday";
                                myfinalobj.isAllday = roomsschedule[5].isAllday;
                                myfinalobj.isClosed = roomsschedule[5].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(myfinalscheduleStartTime);
                                var endTimeDay = new Date(myfinalscheduleEndTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }   
                    }
                    done();        
                },
                function(done)
                {
                    if(isAdminEdit)
                    {
                           logger.log('info', 'PUT'+req._parsedUrl.pathname+'Admin edited the schedule so mail not sent'); 
                            done();
                          res.send({
                               "isbooking": false
                             });                 
                    }
                    else
                    {
                        RoleModel.findOne({"name":"Admin"},function(err,role){
                                     if(err)
                                     {
                                       res.send(400); 	 
                                       logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                     }
                                     else
                                     {
                                         UserModel.find({
                                              role : { "$in" : [role._id] }
                                           }, function(err, users) {

                                               logger.log('info', 'PUT'+req._parsedUrl.pathname+'Sending mail to admin notifying schedule edit'); 
                                               async.each(users, function (user, callback) {

                                                   var mailOptions = {
                                                          to: user.email,
                                                          from: config.mailer.auth.user,
                                                          editedRoomName:editedRoomName,
                                                          roomId:roomId
                                                      };
                                                        mailOptions = templates.send_editroomscheduleemail(mailOptions);
                                                        sendMail(mailOptions);
                                                       notify.addNotificationURL('Schedule Update',editedRoomName+' room schedule is updated',user,'/space/admin/room/list'); 
                                               
                                               callback();
                                             },function(err){
                                                  done();
                                                  res.send({
                                                       "isbooking": false
                                                     });
                                             });
                                         });
                                     }
                             });                  
                    }
                }

            ], function(err) {});
        },
        getAllRoomsFilterByDate: function(req, res) {
            var filterdate = req.query.createdDateFilter;
            filterdate = parseInt(filterdate);
            RoomsSchemaModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).sort({
                created: filterdate
            });
        },
        getAllRoomAmenties: function(req, res) {
            async.waterfall([
                function(done) {
                    PartOfModel.findOne({
                        "name": "Room"
                    }, function(err, items) {
                        if (err) {
                            res.send(400);
                        } else {
                            done(null, items._id);
                        }
                    });
                },
                function(partofroomId, done) {
                    AmenityModel.find({
                        "partOf": partofroomId
                    }, function(err, amenties) {
                        if (err) {
                            res.send(400);
                        } else {
                            res.send(amenties);
                            done();
                        }
                    });
                }
            ], function(err) {});
        },
        getallroomsparticulertospace: function(req, res) {
            var spaceId = req.query.particulerroomsspaceId;
            
            RoomsSchemaModel.find({"spaceId": spaceId}).sort({created:-1}).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });

        },
        confirmupdatescheduledetail: function(req, res) {
            var roomdetail = req.room;
            var bookedarray = req.body.bookedarray;
            var changedschedulearray = req.body.changedschedulearray;
        
            roomdetail = _.extend(roomdetail, req.body);
            async.waterfall([
                function(done) {
                    roomdetail.save(function(err, items) {
                        if (err) {
                            res.send(400);
                        } else {
                            done();
                        }
                    });
                },
                function(done) {
                    async.each(changedschedulearray, function(changedschedulearrayobject, callbackchangedschedulearray) {
                        ScheduleModel.find({
                            'day': changedschedulearrayobject.day
                        }, function(err, docs) {
                            if (err) {
                                res.send(400);
                                callbackchangedschedulearray();
                            } else {
                                async.each(docs, function(scheduleobject, callbackscheduleupdate) {
                                    scheduleobject.initialAval[0].startTime = changedschedulearrayobject.startTime;
                                    scheduleobject.initialAval[0].endTime = changedschedulearrayobject.endTime;
                                    scheduleobject.save(function(err, result) {
                                        if (err) {
                                            res.send(400);
                                        } else {
                                            callbackscheduleupdate();
                                        }
                                    });
                                }, function(err) {
                                    callbackchangedschedulearray();;
                                });
                            }
                        });
                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {});
        },
        cronaddrowtoschedule: function(req, res) {
            async.waterfall([
                function(done) {

                    RoomsSchemaModel.find({"isActive":true,"isPublished":true},function(err,items){
                        if(err)
                        {
                            res.send(400);
                        }
                        else
                        {
                            done(null,items);
                        }


                    }).populate("spaceId", "");

                },
                function(roomobjects,done) {
                    async.each(roomobjects, function(roomsingleobject, callbackschedule) {
                        var roomsschedule = roomsingleobject.roomsslotschedule;
                        var roomId=roomsingleobject._id;
                        var location=roomsingleobject.loc;
    
                        var spaceholiday=roomsingleobject.spaceId.space_holiday;
                            spaceholiday=_.pluck(spaceholiday,"holiday_date");    
  
                        var spaceholidaylist=[];  
                          for(var i=0;i<spaceholiday.length;i++){
                            spaceholidaylist.push(spaceholiday[i].toISOString().substr(0,11));
                          }
                          
                            var scheduleupdatingdate=new Date();                     
                                scheduleupdatingdate.setDate(scheduleupdatingdate.getDate()+90);

                            var updateddate=scheduleupdatingdate;
                            var mycurrentday = updateddate.getDay();


                            var previousdaycreate=new Date();
    
                            var previousdate=new Date(previousdaycreate.setDate(previousdaycreate.getDate() + 89));
                                previousdate=previousdate.toISOString();  
                                previousdate=previousdate.substr(0,11);

                            var nextdaycreate=new Date();

                            var nextdate=new Date(nextdaycreate.setDate(nextdaycreate.getDate() + 91));
                                nextdate=nextdate.toISOString();  
                                nextdate=nextdate.substr(0,11); 

                            var todaydate=new Date();
                                todaydate.setDate(todaydate.getDate()+90);
                                todaydate=todaydate.toISOString();  
                                todaydate=todaydate.substr(0,11); 

                            var univarsaldate = new Date();
                            var univarsaldateminute = univarsaldate.getTimezoneOffset();

                            var offsetTimeFromObject=config.zoneOffset.indiaOffset;  

                           var checkingcurrentdayisholiday= _.contains(spaceholidaylist, todaydate);

                              if (mycurrentday == 0 && roomsschedule[6])
                              { 
                                
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                     
                                var  myunivarsalstarttime=roomsschedule[6].startTime.toISOString().substr(11,13); 
                                var  myunivarsalendtime=roomsschedule[6].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }                          


                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Sunday";
                                    myfinalobj.isAllday = roomsschedule[6].isAllday;
                                    myfinalobj.isClosed = roomsschedule[6].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                              if (mycurrentday == 1 && roomsschedule[0])
                              { 
                                
                              if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[0].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[0].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Monday";
                                    myfinalobj.isAllday = roomsschedule[0].isAllday;
                                    myfinalobj.isClosed = roomsschedule[0].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                              if (mycurrentday == 2 && roomsschedule[1])
                              { 
                                
                              if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[1].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[1].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Tuesday";
                                    myfinalobj.isAllday = roomsschedule[1].isAllday;
                                    myfinalobj.isClosed = roomsschedule[1].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                             if (mycurrentday == 3 && roomsschedule[2])
                              { 
                                
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[2].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[2].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Wednesday";
                                    myfinalobj.isAllday = roomsschedule[2].isAllday;
                                    myfinalobj.isClosed = roomsschedule[2].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                            if (mycurrentday == 4 && roomsschedule[3])
                              { 
                                
                              if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                   var  myunivarsalstarttime=roomsschedule[3].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[3].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Thursday";
                                    myfinalobj.isAllday = roomsschedule[3].isAllday;
                                    myfinalobj.isClosed = roomsschedule[3].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                           if (mycurrentday == 5 && roomsschedule[4])
                              { 
                                
                              if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                   var  myunivarsalstarttime=roomsschedule[4].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[4].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  


                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Friday";
                                    myfinalobj.isAllday = roomsschedule[4].isAllday;
                                    myfinalobj.isClosed = roomsschedule[4].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                           if (mycurrentday == 6 && roomsschedule[5])
                              { 
                                
                              if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[5].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[5].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + 90));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0)  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Saturday";
                                    myfinalobj.isAllday = roomsschedule[5].isAllday;
                                    myfinalobj.isClosed = roomsschedule[5].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(myfinalscheduleStartTime);
                                    var endTimeDay = new Date(myfinalscheduleEndTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 
                             
                     
                      callbackschedule();

                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {
                res.send(200);
            }); 
            
        },
        sendingcronscheddulefailuremailtoadmin: function(req, res) {

             var mailOptions = {
                            to: 'padeecs73@gmail.com',
                            from: config.mailer.auth.user
                        };
                          mailOptions = templates.send_schedulemail(mailOptions);
                          sendMail(mailOptions); 

                  res.send(200);        
        },
        creatingScheduleThroughGenricApi:function(req,res)
        {

            async.waterfall([
                function(done) {
                   ScheduleModel.remove({$softRemove: false},function(err) {

                        if(err)
                        {
                          return res.status(500).json({
                              error : 'Cannot delete the schedules'
                           });           
                        }
                       else
                       {
                           done();
                        }

                      });               

                },
                function(done) {

                    RoomsSchemaModel.find({"isActive":true,"isPublished":true},function(err,items){
                        if(err)
                        {
                            res.send(400);
                        }
                        else
                        {
                            done(null,items);
                        }


                    }).populate("spaceId", "");

                },
                function(roomobjects,done) {
                    async.each(roomobjects, function(roomsingleobject, callbackschedule) {
                        var roomsschedule = roomsingleobject.roomsslotschedule;
                        var roomId=roomsingleobject._id;
                        var location=roomsingleobject.loc;
    
                        var spaceholiday=roomsingleobject.spaceId.space_holiday;
                            spaceholiday=_.pluck(spaceholiday,"holiday_date");    
  
                        var spaceholidaylist=[];  
                          for(var i=0;i<spaceholiday.length;i++){
                            spaceholidaylist.push(spaceholiday[i].toISOString().substr(0,11));
                          }
                          
                     
                        for(var j=0;j<90;j++)
                         {

                            var scheduleupdatingdate=new Date();                     
                                scheduleupdatingdate.setDate(scheduleupdatingdate.getDate()+j);

                            var updateddate=scheduleupdatingdate;
                            var mycurrentday = updateddate.getDay(); 

                            var previousdaycreate=new Date();
    
                            var previousdate=new Date(previousdaycreate.setDate(previousdaycreate.getDate() + (j - 1)));
                                previousdate=previousdate.toISOString();  
                                previousdate=previousdate.substr(0,11);

                            var nextdaycreate=new Date();

                            var nextdate=new Date(nextdaycreate.setDate(nextdaycreate.getDate() + (j + 1)));
                                nextdate=nextdate.toISOString();  
                                nextdate=nextdate.substr(0,11); 

                            var todaydate=new Date();
                                todaydate.setDate(todaydate.getDate()+j);
                                todaydate=todaydate.toISOString();  
                                todaydate=todaydate.substr(0,11); 

                           var univarsaldate = new Date();
                           var univarsaldateminute = univarsaldate.getTimezoneOffset();

                           var offsetTimeFromObject=config.zoneOffset.indiaOffset;  
   
                           var checkingcurrentdayisholiday= _.contains(spaceholidaylist, todaydate); 

                              if (mycurrentday == 0 && roomsschedule[6])
                              {

                                if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                        
                                   var  myunivarsalstarttime=roomsschedule[6].startTime.toISOString().substr(11,13); 
                                   var  myunivarsalendtime=roomsschedule[6].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }   

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Sunday";
                                          myfinalobj.isAllday = roomsschedule[6].isAllday;
                                          myfinalobj.isClosed = roomsschedule[6].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }   

                              if (mycurrentday == 1 && roomsschedule[0])
                              {

                               if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[0].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[0].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Monday";
                                          myfinalobj.isAllday = roomsschedule[0].isAllday;
                                          myfinalobj.isClosed = roomsschedule[0].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  

                             if (mycurrentday == 2 && roomsschedule[1])
                              {

                                if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                         
                                  var  myunivarsalstarttime=roomsschedule[1].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[1].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Tuesday";
                                          myfinalobj.isAllday = roomsschedule[1].isAllday;
                                          myfinalobj.isClosed = roomsschedule[1].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  


                             if (mycurrentday == 3 && roomsschedule[2])
                              {

                                if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[2].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[2].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);                                            

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);;  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Wednesday";
                                          myfinalobj.isAllday = roomsschedule[2].isAllday;
                                          myfinalobj.isClosed = roomsschedule[2].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  

                          if (mycurrentday == 4 && roomsschedule[3])
                              {

                                if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                  var  myunivarsalstarttime=roomsschedule[3].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[3].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Thursday";
                                          myfinalobj.isAllday = roomsschedule[3].isAllday;
                                          myfinalobj.isClosed = roomsschedule[3].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 


                         if (mycurrentday == 5 && roomsschedule[4])
                              {

                                if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                          var  myunivarsalstarttime=roomsschedule[4].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[4].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Friday";
                                          myfinalobj.isAllday = roomsschedule[4].isAllday;
                                          myfinalobj.isClosed = roomsschedule[4].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 

                               if (mycurrentday == 6 && roomsschedule[5])
                                  {
                                    if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                           var  myunivarsalstarttime=roomsschedule[5].startTime.toISOString().substr(11,13); 
                                  var  myunivarsalendtime=roomsschedule[5].endTime.toISOString().substr(11,13);            


                                 var startDate = new Date(todaydate + myunivarsalstarttime);
                                     startDate=startDate.setMinutes(startDate.getMinutes()+univarsaldateminute);
                                 var endDate = new Date(todaydate + myunivarsalendtime);
                                     endDate=endDate.setMinutes(endDate.getMinutes()+univarsaldateminute);

                                 if(offsetTimeFromObject < 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate1) > new Date(checkingdate)) 
                                     {
                                        startDate=new Date(previousdate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 } 

                                  else if(offsetTimeFromObject > 0)    
                               {
                                  var addedoffsetdateStartTime=new Date(startDate);
                                      addedoffsetdateStartTime=addedoffsetdateStartTime.setMinutes(addedoffsetdateStartTime.getMinutes()-offsetTimeFromObject);

                                 var myschedulecreatingdate=new Date();
                                 var checkingdate=new Date(myschedulecreatingdate.setDate(myschedulecreatingdate.getDate() + j));
                                     checkingdate.setHours(0);
                                     checkingdate.setMinutes(0);
                                     checkingdate.setSeconds(0);
                                     checkingdate.setMilliseconds(0);

                                  var checkingdate1=new Date(addedoffsetdateStartTime);
                                      checkingdate1.setHours(0);
                                      checkingdate1.setMinutes(0);
                                      checkingdate1.setSeconds(0);
                                      checkingdate1.setMilliseconds(0);  

                                   if(new Date(checkingdate) > new Date(checkingdate1)) 
                                     {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(nextdate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString(); 
                                      
                                     } 
                                     else
                                     {

                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();

                                     } 

                                 }
                                 else
                                 {
                                        startDate=new Date(todaydate + myunivarsalstarttime);
                                        endDate=new Date(todaydate + myunivarsalendtime);

                                        var myfinalscheduleStartTime=new Date(startDate.toUTCString()).toISOString(); 
                                        var myfinalscheduleEndTime=new Date(endDate.toUTCString()).toISOString();
                                 }  

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Saturday";
                                          myfinalobj.isAllday = roomsschedule[5].isAllday;
                                          myfinalobj.isClosed = roomsschedule[5].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(myfinalscheduleStartTime);
                                          var endTimeDay = new Date(myfinalscheduleEndTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 
        
                           }//for loop close
             
                      callbackschedule();

                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {
                res.send(200);
            }); 

        },
        
        loadRoomBasedOnRoomType:function(req,res){
            if(req.query.roomTypeRooms){
               var roomTypeRoomSelected = req.query.roomTypeRooms;
            }else{
                 var roomTypeRoomSelected = 'undefined';
            }
            RoomsSchemaModel.find({roomtype : req.query.roomTypeRooms}).populate('roomtype').populate('spaceId').exec(function (err, roomTypeRooms) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the roomTypeRooms'
                    });
                }
                res.json(roomTypeRooms);
            });
        },
        
        //API for loading roomtypes,rooms and storing those in a array
         /* fetchRoomsBasedOnRoomType:function(req,res){
        	  
        	  var requiredRoomsTypesList=[{}];
        	  var requiredRoomsList=[{}];
        	  var requiredRoomTypes=[];
        	  var requiredRooms=[];
        	  RoomtypeModel.find({}, function(err, items) {
                  if (err) {
                      res.send(400);
                  } 
                  //res.json(items);
                  else{
                   requiredRoomTypes=items;
                  console.log("++++++++++++++in room type++++++++++++++++++++++++++");
            	  console.log(requiredRoomTypes);
            	  RoomsSchemaModel.find({}, function(err, rooms) {
            		  //console.log("in room ss===============");
                      if (err) {
                          res.send(400);
                      } 
                     // res.json(items,rooms);
                      //console.log(rooms);
                      else{
                      requiredRooms =rooms;
                      //console.log("++++++++++++++in rooms++++++++++++++++++++++++++");
                      //console.log(requiredRooms);
                     // res.json(items,rooms);
                      
                      for(var i=0;i<requiredRoomTypes.length;i++){
                    	  //console.log(requiredRoomTypes[i]._id);
                    	  var requiredObject={};
                    	  requiredObject.roomType=requiredRoomTypes[i].name;
                    	  console.log(requiredObject.roomType);
                    	  for(var j=0;j<requiredRooms.length;j++){
                    		  //console.log(requiredRooms[j].roomtype);
                    	//	  console.log(requiredRoomTypes.length);
                    		//  console.log(requiredRooms.length);
                    		  requiredObject.rooms=[{}];
                    		  if(requiredRoomTypes[i]._id.toString() ==requiredRooms[j].roomtype.toString()){
                    			  console.log("in iffffffffffffff");
                    			   requiredRoomsList.push({
                    			     roomType:requiredRoomTypes[i].name,
                    			     roomName:requiredRooms[j].name
                    			  });
                    			  console.log("tripohjkdhfkfhjkj");
                    	//		  console.log(requiredRoomsList);
                    			  requiredObject.rooms.push(requiredRooms);
                    			  console.log(requiredObject.rooms);
                    		  }
                    		  
                    	  }
                    	  requiredRoomsList.push(requiredObject);
                    	  console.log(requiredRoomsList);
                      }
                      res.send(requiredRoomsList);
                      }
                      });
                  }
               });
        	 
        	  
          }*/
       
        fetchRoomsBasedOnRoomType:function(req,res){
      	  
      	  var requiredRoomsTypesList=[{}];
      	  var requiredRoomsList=[{}];
      	  var requiredRoomTypes=[];
      	  var requiredRooms=[];
      	  RoomtypeModel.find({}).sort({name: 1}).exec(function(err, items) {
                if (err) {
                    res.send(400);
                } 
                else{
                 requiredRoomTypes=items;
          	     RoomsSchemaModel.find({}, function(err, rooms) {
                    if (err) {
                        res.send(400);
                    } 
                    else{
                           requiredRooms =rooms;
                           async.each(requiredRoomTypes, function(requiredRoomTypesobject, callbackroomTypes) {
                    	          var requiredObject={};
                    	          requiredObject.roomTypeID=requiredRoomTypesobject._id;
                  	              requiredObject.roomType=requiredRoomTypesobject.name;
                  	              async.each(requiredRooms, function(requiredRoomsobject, callbackRooms) {
                  	            	 requiredObject.rooms=[{}];
                  	    	            if(requiredRoomTypesobject._id.toString() ==requiredRoomsobject.roomtype.toString()){
                  	    	            	for(var i=0;i<requiredRooms.length;i++){
                  	    	            		requiredObject.rooms.push({
                    			                	  id:requiredRooms[i]._id,
                    			                	  name:requiredRooms[i].name
                    			                  });
                  	    	            	}
                  			                  
                  		                 }
                  	    	             callbackRooms();
                                    }, function(err) {
                    	                     requiredRoomsList.push(requiredObject);
                    	                     callbackroomTypes();
                                       });
                                   }, function(err) {
                    	                   res.send(requiredRoomsList);
                                     });
                            }
                    });
                }
             });
      	 
        },
        loadRoomBasedOnStatus:function(req,res){
           var roomStatus = new RegExp('^' + req.query.status + '$', "i");
          if(req.query.status == 'All'){
            var querySelected = {};
          }else{
            var querySelected = {'status': roomStatus };
          }

            RoomsSchemaModel.find(querySelected).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });
        },
        getAllRoomsSortByPrice: function(req, res) {
            var priceSorting = req.query.selectedPrice;
            priceSorting = parseInt(priceSorting);
            var roomsList = req.query.rooms;
            RoomsSchemaModel.find({}, function(err, roomsList) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(roomsList);
                }
            }).sort({
                pricePerhour: priceSorting
            });
        },
        getAllRoomsSortByRating: function(req, res) {
            var rateSorting = req.query.selectedRating;
            rateSorting = parseInt(rateSorting);
            RoomsSchemaModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).sort({
                avgRating: rateSorting
            });
        },
        approvingSpaceByAdmin:function(req,res){
            var spacId=req.body.spaceId;

           SpaceModel.findOne({"_id":spacId},function(err,item){
                if(err)
                {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve space  '+err+'');
                    res.send(400);
                }
                else
                {             
                    item.approveStatus="approved";
                    item.save(function(err){
                      if(err)
                      {
                         logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve room  '+err+'');
                          res.send(400);
                      }
                      else
                      {
                          res.send(200);
                      }
                    });
                }

           }); 

        },   

        loadRoomTypeSchedule: function(req, res) {
            RoomtypeModel.find({$or:[{'name':'Meeting Room' },
                                     {'name':'Board Room'}]}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            });
        }
        

    };
};