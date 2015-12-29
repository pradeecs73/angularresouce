'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('JobsController', ['$scope', '$location','Global', 'Jobs', '$http','$rootScope','PROFILE','$stateParams',
    function($scope,$location, Global, Jobs, $http,$rootScope,PROFILE,$stateParams) {
        $scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.SERVICE = Jobs;
        initializePagination($scope, $rootScope, $scope.SERVICE);
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
            /*Jobs.jobdetails.query(function(response){
               $scope.collection=response;
             });*/
             
                $scope.currentPage = 1;
                $scope.currentPageSize = 5; 
                var query = {};
                query.page = $scope.currentPage;
                query.pageSize = $scope.currentPageSize;
                $scope.loadPagination(query);

        };

        $scope.completejobdetail = function() {
            var jobidparams=$stateParams.jobId;
            Jobs.jobdetails.get({'jobId':jobidparams},function(response) {
                $scope.singlejobdetail=response;
            });
        };
        $scope.redirectdashboard = function(){
	           $location.path(PROFILE.URL_PATH.DASHBOARD);
	     }

    }
]);