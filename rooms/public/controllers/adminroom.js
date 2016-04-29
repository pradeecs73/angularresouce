  'use strict';
  var roomModule = angular.module('mean.rooms');
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
                 console.log(response);
              }, function(error) {
                  $scope.error = error;
              });
          };

          $scope.approveOrRejectRoom=function(room)
          {
              $rootScope.roomdetails=room;
              $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST_VIEW);   
          };

          $scope.viewRoomDetail=function()
          {
             $scope.room=$rootScope.roomdetails;
          };

      }
  ]);