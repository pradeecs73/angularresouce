'use strict';
/**
 * Module dependencies.
 */
require('../../../search/server/models/search.js');
require('../../../amenity/server/models/amenities.js');
require('../../../amenity/server/models/partOf.js');
require('../../../booking/server/models/booking.js');
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
module.exports = function(Rooms) {
    return {
        /* list : function(req, res) {
           var _user = req.user;
           // if we do not have admin or partner role return here.
           if(_user.roles.indexOf('admin') === -1 && _user.roles.indexOf('partner')) {
             return res.status(401).send('User is not authorized for this action');
           }
           Spaces.findById(req.params.id).exec(function(err, space) {
             if (err)  {
               return res.json(err);
             }
             if(!space) {
               return res.json({ "error": "unable to find rooms"});
             }
             // send all rooms associated with this space.
             return res.json(space.rooms);
           });
         },
   
         get : function(req, res) {
           var _user = req.user;
           // if we do not have admin or partner role return here.
           if(_user.roles.indexOf('admin') === -1 && _user.roles.indexOf('partner')) {
             return res.status(401).send('User is not authorized for this action');
           }
           Rooms.findById(req.params.id).exec(function(err, room) {
             if (err)  {
               return res.json(err);
             }
             if(!space) {
               return res.json({ "error": "unable to find room"});
             }
             return res.json(room);
           });
         },

         add: function(req, res) {
           var room = new Rooms(req.body);
           // because we set our user.provider to local our models/user.js validation will always be true
           req.assert('name', 'You must enter a name').notEmpty();
           req.assert('room_type', 'You must enter a valid room type').isEmail();
           var errors = req.validationErrors();
           if (errors) {
             return res.status(400).send(errors);
           }
           room.save(function(err) {
               if (err) {
                   switch (err.code) {
                       case 11000:
                       case 11001:
                       res.status(400).json([{
                           msg: 'Username already taken',
                           param: 'username'
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
               res.status(200);
           });
         },

         update : function(req, res) {
           if(_user.roles.indexOf('admin') === -1 && _user.roles.indexOf('partner')) {
             return res.status(401).send('User is not authorized for this action');
           }
           Rooms.findOneAndUpdate({"_id": req.body.id}, req.body, {new: false}, function(err, aminity) {
             if (err) {
               res.status(500).send({'status' : false});
             }
             else {
               res.status(200).send({'status' : true});
             }
           });          
         },

         delete : function(req, res) {
           if(_user.roles.indexOf('admin') === -1 && _user.roles.indexOf('partner')) {
             return res.status(401).send('User is not authorized for this action');
           }
           Rooms.findOneAndUpdate({"_id": req.body.id}, {"status" : 0}, {new: false}, function(err, aminity) {
             if (err) {
               res.status(500).send({'status' : false});
             }
             else {
               res.status(200).send({'status' : true});
             }
           }); 
         } */
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
        createroom: function(req, res) {
            var roomcreate = new RoomsSchemaModel(req.body);
            var roomsschedule = req.body.roomsslotschedule;
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
                    roomcreate.save(function(err, items) {
                        if (err) {
                            return res.send(400);
                        } else {
                            done(null, items._id, items.loc);
                        }
                    });
                },
                function(roomId, location, done) {
                    SpaceModel.findOne({
                        "_id": spaceId
                    }, function(err, spaceitem) {
                        if (err) {
                            res.send(400);
                        } else {
                            spaceitem.rooms.push({
                                "roomId": roomId,
                                "status": "active"
                            });
                            spaceitem.save(function(err, itemd) {
                                if (err) {
                                    res.send(400);
                                } else {
                                    done(null, roomId, location);
                                }
                            });
                        }
                    });
                },
                function(roomId, location, done) {
                    for (var i = 0; i < 90; i++) {
                        var myday = new Date();
                        var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));
                        var mycurrentday = mycurrentdate.getDay();
                        if (mycurrentday == 0) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Sunday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[6].startTime);
                            var endTimeDay = new Date(roomsschedule[6].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 1) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Monday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[0].startTime);
                            var endTimeDay = new Date(roomsschedule[0].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 2) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Tuesday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[1].startTime);
                            var endTimeDay = new Date(roomsschedule[1].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 3) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Wednesday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[2].startTime);
                            var endTimeDay = new Date(roomsschedule[2].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 4) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Thursday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[3].startTime);
                            var endTimeDay = new Date(roomsschedule[3].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 5) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Friday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[4].startTime);
                            var endTimeDay = new Date(roomsschedule[4].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                        if (mycurrentday == 6) {
                            var myfinalobj = {};
                            myfinalobj.room = roomId;
                            myfinalobj.loc = location;
                            myfinalobj.day = "Saturday";
                            myfinalobj.date = mycurrentdate;
                            myfinalobj.bookings = [];
                            var myfinalschedule = [];
                            var startTimeDay = new Date(roomsschedule[5].startTime);
                            var endTimeDay = new Date(roomsschedule[5].endTime);
                            var myobj = {};
                            myobj.startTime = new Date(startTimeDay.setDate(startTimeDay.getDate() + i));
                            myobj.endTime = new Date(endTimeDay.setDate(endTimeDay.getDate() + i));
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
                    done();
                }
            ], function(err, result) {
                res.send(200);
            });
        },
        getAllRooms: function(req, res) {
            RoomsSchemaModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).populate("spaceId", "");
        },
        deleteroom: function(req, res) {
            var deleteroom = req.room;
            var roomdeleteId = req.room._id;
            var spaceId = req.room.spaceId._id;
            async.waterfall([
                function(done) {
                    deleteroom.remove(function(err, deletedroom) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot delete the room'
                            });
                        } else {
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
            ], function(err, result) {
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
                function(done) {
                    for (var i = 0; i < roomslotscheduleafter.length; i++) {
                        if (new Date(roomslotschedulebefore[i].startTime).getTime() != new Date(roomslotscheduleafter[i].startTime).getTime() || new Date(roomslotschedulebefore[i].endTime).getTime() != new Date(roomslotscheduleafter[i].endTime).getTime()) {
                            present.push(roomslotscheduleafter[i]);
                        }
                    }
                    done();
                },
                function(done) {
                    
                    async.each(present, function(roomslotobject, callback) {
                        BookingModel.find({'day':roomslotobject.day},function(err,docs){
                           if(err)
                           {
                           	 res.send(400);
                           	 callback();
                           }
                           else
                           {
                           	 console.log(docs);
                           	  async.each(docs, function(bookingdoc, callbackbooking) {  
                                   bookingarray.push(bookingdoc);
                                   callbackbooking();
                           	  },function(err){
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
                        res.send({
                            "isbooking": true
                        })
                    } else {
                        done();
                    }
                },
                function(done) {
                    roomdetail.save(function(err, items) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send({
                                "isbooking": false
                            });
                            done();
                        }
                    });
                }
            ], function(err, result) {});
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
            ], function(err, result) {});
        },
        getallroomsparticulertospace: function(req, res) {
            var spaceId = req.query.particulerroomsspaceId;
            RoomsSchemaModel.find({
                "spaceId": spaceId
            }, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).populate("spaceId", "");
        }
    };
};