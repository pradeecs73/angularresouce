'use strict';

angular.module('mean.space').factory('RoomService', 
  function($resource) {
    return {
         loadroomtypes : $resource('/api/addroom/loadroomtypes', {}, {
          update: { method: 'PUT' },
          query: { method: 'GET', isArray: true }
        }),
       roomdetails: $resource('/api/roomdetails/:roomId', {roomId: '@_id'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        roomdatefilter: $resource('/api/getRoomsFilterDate', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       amenityroomlist: $resource('/api/space/room/amenity', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       loadroomparticulertospace: $resource('/api/space/room/getroomsparticulertospace', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        updatescheduleeditdata: $resource('/api/scheduleeditroomdetails/:scheduleeditroomId', {scheduleeditroomId: '@_id'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        getroomtypename: $resource('/api/room/gettingroomtypename', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         checkingadmin: $resource('/api/room/checkingadmin', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         adminrooms: $resource('/api/room/admin/getAllRooms', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        })

    };
  });
