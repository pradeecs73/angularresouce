'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('CountryController',

		function($scope, $rootScope, $stateParams, $location, Global, CountryService, UserService, BRANCH, PROFILE) {
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
		        
				
			$scope.list = function() {
				$scope.country = {};
				CountryService.country.query(function(countries) {
					$scope.countries = countries;
				});
			};
			
			$scope.newCountry = function() {
				$location.path(BRANCH.URL_PATH.CREATECOUNTRY);
			}
			
			$scope.create = function(isValid) {
				if (isValid) {
					var country = new CountryService.country($scope.country);
					country.$save(function(response) {
						$location.path(BRANCH.URL_PATH.LISTCOUNTRY);
						$scope.country = {};
					},function(error){
						$scope.error= error;
					});
				} else {
					
					$scope.submitted = true;
				}

			};

			$scope.remove = function(Country) {				
				if (Country) {
					console.log(Country);
					Country.$remove(function(response) {
						for ( var i in $scope.countries) {
							if ($scope.countries[i] === Country) {
								$scope.countries.splice(i, 1);
							}
						}
						  $('#deleteCountry').modal("hide");
						  $location.path(BRANCH.URL_PATH.LISTCOUNTRY);
						//$location.path('/admin/country/list');
					});
				} else {
					$scope.country.$remove(function(response) {
						$location.path(BRANCH.URL_PATH.LISTCOUNTRY);
					});
				}
			};

			$scope.update = function(isValid) {
				if (isValid) {
					var country = new CountryService.country($scope.country);
					if (!country.updated) {
						country.updated = [];
					}
					country.updated.push(new Date().getTime());

					country.$update({
						countryId : $stateParams.countryId
					}, function() {
						$location.path(BRANCH.URL_PATH.LISTCOUNTRY);
					},function(error){
						$scope.error= error;
						console.log($scope.error);
					});
				} else {
					$scope.submitted = true;
				}
			};
			
			$scope.show = function(urlPath,country){
				$rootScope.country = country;
				urlPath=urlPath.replace(":countryId",country._id);
	        	 $location.path(urlPath);
				/*$location.path('/admin/country/'+country._id+'/show');*/
			}

			$scope.zoneList = function(urlPath,country){
				$rootScope.country = country;
				  urlPath=urlPath.replace(":countryId",country._id);
				  $location.path(urlPath);
			}

			$scope.findOne = function() {
				CountryService.country.get({
					countryId : $stateParams.countryId
				}, function(country) {
					$scope.country = country;
				});
			};

			$scope.cancel = function() {
				$location.path(BRANCH.URL_PATH.LISTCOUNTRY);
			};
			
			 $scope.modalDeleteCountry = function (country) {
				console.log(country);
				$scope.removepop(country._id);
	            $scope.country = country;
	            $('#deleteCountry').modal("show");
	            
	        };
	        
	        $scope.removepop = function(countryId) {
	            $scope.countryId = countryId;
	            $scope.users = {};
	            UserService.country.query({
	            	countryId: countryId
	            }, function(countries) {
	                if (countries[0].Message == 'There is no such Country available.') {
	                    $scope.countrydeletetext = "No zones are assigned would you like to delete country?";
	                } else {
	                    $scope.countrydeletetext = (countries.length) + "  Zones are assigned to this country. Do you really want to delete this country ? This action cannot be undone."
	                }
	            });
	        };
	        
	        $scope.cancelCountry = function(){
	        	   $('#deleteCountry').modal("hide");
	        };
	        
	        
	        $scope.editCountry=function(urlPath,id){		        
	        	   urlPath=urlPath.replace(":countryId",id);
	        	   $location.path(urlPath);
	        };
	        
	        $scope.redirectdashboard = function(){
	            $location.path(PROFILE.URL_PATH.DASHBOARD);
	         }

		});
