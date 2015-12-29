'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('JobsController', ['$scope', '$location','Global', 'Jobs', '$http', 'PROFILE','$stateParams',
    function($scope,$location, Global, Jobs, $http, PROFILE,$stateParams) {
        $scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.package = {
            name: 'jobs'
        };
  
        $scope.addjobs = function() {
            $http.get("/api/addjobs").success(function(response) {
                console.log(response);
            }).error(function(response) {
            });
        };

        $scope.joblistpage = function() {
           $location.path("/jobs")
        };

         $scope.listjobs = function() {
            Jobs.query(function(response){
               $scope.joblist=response;
             });
        };

        $scope.completejobdetail = function() {
            var jobidparams=$stateParams.jobId;
            Jobs.get({'jobId':jobidparams},function(response) {
                $scope.singlejobdetail=response;
            });
        };
        $scope.redirectdashboard = function(){
	           $location.path(PROFILE.URL_PATH.DASHBOARD);
	     }

    }
]);