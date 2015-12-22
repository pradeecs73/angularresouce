'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('ZoneController',
		function($scope, $rootScope, $stateParams, $location, Global, ZoneService,BRANCH,PROFILE) {
			$scope.global = Global;
			$scope.package = {
				name : 'branch'
			};		
			$scope.BRANCH=BRANCH;
			$scope.PROFILE=PROFILE;
			 $scope.hasAuthorization = function (branch) {

		            if (!branch || !branch.user) {
		             return false;
		             }
		            return MeanUser.isAdmin || branch.user._id === MeanUser.user._id;
		        };
		        
			$scope.countryId = $rootScope.countryId;
			$scope.zoneId = $rootScope.zoneId;
			
			$scope.newZone = function(urlPath,countryId) {
				$scope.countryId = $rootScope.countryId;
				  urlPath=urlPath.replace(":countryId",countryId);
	        	   $location.path(urlPath);
				
			}
			
			
			$scope.list = function() {
				$scope.countryId = $stateParams.countryId;
				$rootScope.countryId = $scope.countryId;
				
				ZoneService.countryZone.query({countryId: $scope.countryId}, function(zones) {
					$scope.zones = zones;
				});
			};

			$scope.create = function(urlPath,isValid) {
				var countryId = $scope.countryId;
				if (isValid) {
					$scope.zone.countryId = $scope.countryId;
					var zone = new ZoneService.countryZone($scope.zone);
					
					zone.$save(function(response) {
						urlPath=urlPath.replace(":countryId",countryId);
			        	   $location.path(urlPath);
						$scope.zone = {};
					},function(error){	
						console.log(error);
						$scope.error= error;
					});
				} else {
					$scope.submitted = true;
				}
			};

			$scope.remove = function(Zone) {
				var countryId = $scope.countryId;
				if (Zone) {
					Zone = new ZoneService.zone(Zone);
					$scope.zone.countryId = $scope.countryId;
					Zone.$remove(function(response) {
						for ( var i in $scope.zones) {
							if ($scope.zones[i]._id === Zone._id) {
								$scope.zones.splice(i, 1);
							}
						}
						$('#deleteZone').modal("hide");
						//$location.path('/admin/country/'+countryId+'/zone/list');
					});
				} else {
					$scope.zone.$remove(function(response) {
						$('#deleteZone').modal("hide");
						//$location.path('/admin/country/'+countryId+'/zone/list');
					});
				}
			};

			$scope.update = function(urlPath,isValid) {
			
				/*console.log(countryIds);*/
				$scope.countryId = $rootScope.countryId;
				if (isValid) {
					var countryId = $scope.countryId;
					console.log(countryId);
					var zone = new ZoneService.zone($scope.zone);
					
					if (!zone.updated) {
						zone.updated = [];
					}
					zone.updated.push(new Date().getTime());
					
					zone.$update({
						zoneId : $stateParams.zoneId
					}, function() {
						urlPath=urlPath.replace(":countryId",countryId);
			        	   $location.path(urlPath);
					},function(error){
						$scope.error= error;
						console.log($scope.error);
					});
				} else {
					$scope.submitted = true;
				}
			};

			$scope.findOne = function() {
				ZoneService.zone.get({
					zoneId : $stateParams.zoneId
				}, function(zone) {
					$scope.zone = zone;
					$scope.countryId = $scope.zone.country;
				});
			};

			$scope.cancel = function(urlPath,countryId) {
				console.log(countryId);
				urlPath=urlPath.replace(":countryId",countryId);
	        	   $location.path(urlPath);
			};
			
			$scope.cancelEdit = function(urlPath,countryId) {
				urlPath=urlPath.replace(":countryId",countryId._id);
	        	   $location.path(urlPath);
			};
			
			 $scope.modalDeleteZone = function (zone) {
		            $scope.zone = zone;
		            console.log($scope.zone);
		            $('#deleteZone').modal("show");
		         
		        };
		        $scope.cancelZone = function(){
		        	$('#deleteZone').modal("hide");
		        };
		        	
		       $scope.editZone=function(urlPath,id){		        
		        	   urlPath=urlPath.replace(":zoneId",id);
		        	   $location.path(urlPath);
		        };  	
		        
		        $scope.cityList = function(urlPath,zone){
					$rootScope.zone = zone;
					console.log(zone);
					  urlPath=urlPath.replace(":zoneId",zone._id);
		        	  $location.path(urlPath);			
				};
				$scope.redirectdashboard = function(){
			           $location.path(PROFILE.URL_PATH.DASHBOARD);
			     }

		});
