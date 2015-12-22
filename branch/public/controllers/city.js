'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('CityController',
		function($scope, $rootScope, $stateParams, $location, Global, CityService,BRANCH,PROFILE) {
			$scope.global = Global;
			$scope.package = {
				name : 'branch'
			};
			$scope.BRANCH=BRANCH;
			
			$scope.PROFILE = PROFILE;
			
			 $scope.hasAuthorization = function (branch) {

		            if (!branch || !branch.user) {
		             return false;
		             }
		            return MeanUser.isAdmin || branch.user._id === MeanUser.user._id;
		        };
		        
			$scope.countryId = $rootScope.countryId;
			 $scope.zoneId = $rootScope.zoneId ;
			 $scope.cityId = $rootScope.cityId ;
			
			$scope.list = function() {
				$scope.zoneId = $stateParams.zoneId;
				$rootScope.zoneId = $scope.zoneId;
				
				CityService.zoneCity.query({zoneId: $scope.zoneId}, function(cities) {
					$scope.cities = cities;
				});
			};

			$scope.newCity = function(urlPath,zoneId) {
				 $scope.zoneId = $rootScope.zoneId ;
				 urlPath=urlPath.replace(":zoneId",zoneId);
	        	   $location.path(urlPath);				
			}
			
			$scope.create = function(urlPath,isValid) {
				
				var zoneId = $scope.zoneId;
				if (isValid) {
					$scope.city.zoneId = $scope.zoneId;
					var city = new CityService.zoneCity($scope.city);
					city.$save(function(response) {
						urlPath=urlPath.replace(":zoneId",zoneId);
			        	   $location.path(urlPath);									
						$scope.city = {};
					},function(error){	
						$scope.error= error;
						console.log(error);
					});
				} else {
					$scope.submitted = true;
				}
			};

			$scope.remove = function(City) {
				var zoneId = $scope.zoneId;
				if (City) {
					City = new CityService.city(City);
					City.$remove(function(response) {
						for ( var i in $scope.cities) {
							if ($scope.cities[i]._id === City._id) {
								$scope.cities.splice(i, 1);
							}
						}
						  $('#deleteCity').modal("hide");
						
					});
				} else {
					$scope.city.$remove(function(response) {
						  $('#deleteCity').modal("hide");
					});
				}
			};

			$scope.update = function(urlPath,isValid) {
				 $scope.zoneId = $rootScope.zoneId ;
				 console.log($scope.zoneId );
				if (isValid) {
					var zoneId = $scope.zoneId;
					var city = new CityService.city($scope.city);
					if (!city.updated) {
						city.updated = [];
					}
					city.updated.push(new Date().getTime());

					city.$update({
						cityId : $stateParams.cityId
					}, function() {
						urlPath=urlPath.replace(":zoneId",zoneId);
			        	   $location.path(urlPath);						
					},function(error){
						$scope.error= error;
						console.log($scope.error);
					});
				} else {
					alert("Some field is missing.");
					$scope.submitted = true;
				}
			};

			$scope.findOne = function() {
				CityService.city.get({
					cityId : $stateParams.cityId
				}, function(city) {
					$scope.city = city;
					$scope.zoneId = $scope.city.zone;
				});
			};

			$scope.cancel = function(urlPath,zoneId) {
				urlPath=urlPath.replace(":zoneId",zoneId);
	        	   $location.path(urlPath);
			};
			
			 $scope.modalDeleteCity = function (city) {
		            $scope.city = city;
		            $('#deleteCity').modal("show");
		         
		        };
		        
		        $scope.cancelCity = function(){
		        	  $('#deleteCity').modal("hide");
		        }
		        
		        $scope.editCity=function(urlPath,id){		        
		        	   urlPath=urlPath.replace(":cityId",id);
		        	   $location.path(urlPath);
		        };  	
		        
		        $scope.branchList = function(urlPath,city){
					$rootScope.city = city;
					  urlPath=urlPath.replace(":cityId",city._id);
		        	  $location.path(urlPath);			
				};
				
				
				$scope.redirectdashboard = function(){
			           $location.path(PROFILE.URL_PATH.DASHBOARD);
			     }
		      
		});
