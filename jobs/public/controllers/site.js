'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('SiteController', function($scope, Global, SiteService, $stateParams,PROFILE, flash, MESSAGES, $location, $rootScope,JOBS) {
    $scope.global = Global;
    $scope.SERVICE = SiteService;
    $scope.PROFILE = PROFILE;
    $scope.MESSAGES = MESSAGES;
    $scope.JOBS=JOBS;

	initializePagination($scope, $rootScope, $scope.SERVICE);
	
    $scope.package = {
        name: 'jobs'
    };
    
    $scope.find = function () {
		/*SiteService.query(function (sites) {
            $scope.sites =sites;
        });*/
    	$scope.currentPage = 1;
        $scope.currentPageSize = 10; 
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };
    
    $scope.create = function(isValid) {
        if (isValid) {
        	var site = new SiteService.site($scope.site)
            site.$save(function(response) {
            flash.setMessage(MESSAGES.SITE_ADD_SUCCESS,MESSAGES.SUCCESS);
            $location.path(JOBS.URL_PATH.SITELIST);
                $scope.site = {};
            }, function(error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }
    };
    
    $scope.remove = function(Site) {
        if (Site) {
        	var site = new SiteService.site(Site);
            site.$remove(function(response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === Site) {
                        $scope.collection.splice(i, 1);
                    }
                }
                $('#deleteSite').modal("hide");
               flash.setMessage(MESSAGES.SITE_DELETE_SUCCESS,MESSAGES.SUCCESS);
               $location.path(JOBS.URL_PATH.SITELIST);
            });
        }
    };
    $scope.update = function(isValid) {
        if (isValid) {
            var site = $scope.site;
            if (!site.updated) {
                site.updated = [];
            }
            site.updated.push(new Date().getTime());
            
            site.$update(function() {
            flash.setMessage(MESSAGES.SITE_UPDATE_SUCCESS,MESSAGES.SUCCESS);
            $location.path(JOBS.URL_PATH.SITELIST);
            }, function(error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function() {
        SiteService.site.get({
            siteId: $stateParams.siteId
        }, function(site) {
            $scope.site = site;
        });
    };
    $scope.cancelSite = function() {
        $location.path(JOBS.URL_PATH.SITELIST);
    };
    $scope.newSite = function() {
        $location.path(JOBS.URL_PATH.SITECREATE);
    };
    $scope.modalDeleteSite = function(site) {
        $scope.site = site;
        $('#deleteSite').modal("show");
    };
    $scope.cancelDelete = function() {
        $('#deleteSite').modal("hide");
    };
    $scope.redirectdashboard = function(){
        $location.path(PROFILE.URL_PATH.DASHBOARD);
  };
  $scope.siteDetails=function(site){
	$scope.site=site;
	$location.path('/admin/site/'+ site._id +'/details');
  };
});