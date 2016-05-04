  'use strict';
  var roomModule = angular.module('mean.rooms',['datatables']);
  roomModule.controller('AdminRoomsController', ['$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceService', 'RoomService', 'Upload', 'MeanUser', 'flash', 'ShareHolidaysService', '$parse', 'SpaceTypeService', '$timeout', 'MESSAGES', 'ROOMS',
      function($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceService, RoomService, Upload, MeanUser, flash, ShareHolidaysService, $parse, SpaceTypeService, $timeout, MESSAGES, ROOMS) {
          $scope.global = Global;
          hideBgImageAndFooter($rootScope);
          $scope.package = {
              name: 'rooms',
              modelName: 'Rooms',
              featureName: 'Admin Rooms'
          };

          initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);

             $scope.loadAdminRooms = function() {
              RoomService.adminrooms.query(function(response) {
                 $scope.roomdetails = response;
              }, function(error) {
                  $scope.error = error;
              });
          };

            $scope.approveOrRejectRoomPage=function(room)
          {
              $location.url(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST_VIEW+'?selectedId=' + room._id);   
          };

          $scope.viewRoomDetail=function()
          {
                var queryParams = $location.search();
             RoomService.roomdetails.get({"roomId" : queryParams.selectedId }, function(response) {
              console.log(response);
              $scope.room = response;
            }, function(error) {
              console.log(error);
            });
            // $scope.room=$rootScope.roomdetails;
          };

          $scope.approveOrRejectRoom=function(room,message)
          {
             RoomService.approveorrejectroom.update({"roomId":room._id,"status":message},function(response){
                  $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST);
             },function(error){
                   console.log(error);
             });
          };

          $scope.approveOrRejectRoom=function(room,message)
          {
             RoomService.approveorrejectroom.update({"roomId":room._id,"status":message},function(response){
                  $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST);
             },function(error){
                   console.log(error);
             });
          };

           $scope.publishRoom = function(room) {

            RoomService.publishRoom.update({"roomId":room._id},function(response){
                  room.isPublished=true;
                  room.status="published";
             },function(error){
                   console.log(error);
             });

        };

      }
  ]);