'use strict';

/* jshint -W098 */
var branchModule = angular.module('mean.branch', ['ngFileUpload']);
branchModule.controller('BranchController',
		function($scope, $rootScope, $stateParams, $location, Global, BranchService,CountryService,ZoneService,CityService,Upload,$timeout,BRANCH,PROFILE) {
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
			$scope.zoneId = $rootScope.zoneId;
			$scope.cityId = $rootScope.cityId;
			
			//passing the cityid for creating the new branch
			$scope.newBranch= function(urlPath,cityId) {
				console.log(cityId);
				$scope.cityId = $rootScope.cityId;
				  urlPath=urlPath.replace(":cityId",cityId);
	        	   $location.path(urlPath);
			}
			
			//fetching the branches related to city
			$scope.list = function() {
				$scope.cityId = $stateParams.cityId;
				$rootScope.cityId = $scope.cityId;
	
				BranchService.cityBranch.query({cityId: $scope.cityId}, function(branches) {
					$scope.branches = branches;
				});
			};

						
			$scope.cityId = $rootScope.cityId;
			$scope.branch={};
			$scope.branch.address={};
			$scope.create = function(urlPath,isValid) {
				console.log(branch);
				var cityId = $stateParams.cityId;
				console.log(isValid);
				if (isValid) {
					$scope.branch.cityId = $stateParams.cityId;
					var branch = new BranchService.cityBranch($scope.branch);
					branch.$save(function(response) {
						urlPath=urlPath.replace(":cityId",cityId);
			        	   $location.path(urlPath);					
						$scope.branch = {};
					}, function(error) {
						$scope.error = error;
					});
				} else {
					$scope.submitted = true;
				}
			};

			
			//remove the branch in city 
			$scope.remove = function(Branch) {
				var cityId = $scope.cityId;
				if (Branch) {
					Branch = new BranchService.branch(Branch);
					Branch.$remove(function(response) {
						for ( var i in $scope.branches) {
							if ($scope.branches[i]._id === Branch._id) {
								$scope.branches.splice(i, 1);
							}
						}
						  $('#deleteBranch').modal("hide");
						  
					},function(error){
						$scope.error= error;
						console.log($scope.error);
					});
				} else {
					$scope.branch.$remove(function(response) {
						 $('#deleteBranch').modal("hide");
					});
				}
			};

			//update the branch
			$scope.update = function(urlPath,isValid) {
				var cityId = $scope.cityId;
				console.log('aaaa');
				if (isValid) {
					console.log('aaaa');
					var branch = $scope.branch;
					if (!branch.updated) {
						branch.updated = [];
					}
					branch.updated.push(new Date().getTime());

					branch.$update({
						branchId : $stateParams.branchId
					},function() {
						console.log('aaa'+branchId);
						urlPath=urlPath.replace(":cityId",cityId);
			        	   $location.path(urlPath);					
					},function(error){
						$scope.error=error;
					});
				} else {
					$scope.submitted = true;
				}
			};

			//fetching the one branch details
			$scope.findOne = function() {
				BranchService.branch.get({
					branchId : $stateParams.branchId
				}, function(branch) {
					$scope.branch = branch;
					$scope.cityId = $scope.branch.city;
				});
			};

			//for cancel button
			$scope.cancel = function(urlPath,cityId) {
				var cityId = $scope.cityId;
				urlPath=urlPath.replace(":cityId",cityId);
	        	   $location.path(urlPath);					
			
			};
			
			 $scope.modalDeleteBranch = function (branch) {
		            $scope.branch = branch;
		            $('#deleteBranch').modal("show");
		         
		        };
				
		        $scope.cancelBranch = function(){
		        	 $('#deleteBranch').modal("hide");
		        };
		        
		        $scope.onBranchFileSelect = function (image) {
		        	/*console.log($scope.branch);*/
		            if (angular.isArray(image)) {
		                image = image[0];
		            }
		            // This is how I handle file types in client side
		            if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
		                alert('Only PNG and JPEG are accepted.');
		                return;
		            }
		            $rootScope.$emit('processingContinue');
		            $scope.upload = Upload.upload({
		                url: '/api/branch/picture/branchPicture',
		                method: 'POST',
		                file: image
		            }).progress(function (event) {

		               // $scope.uploadProgress = Math.floor(event.loaded /
						// event.total);

		                // $scope.$apply();
		            }).success(function (data, status, headers, config) {
		                if(config){}
		                $scope.uploadInProgress = false;
		                // If you need uploaded file immediately
		                $timeout(function () {
		                    $scope.branch.picture = data;
		                   /* $rootScope.user = $scope.user;
		                    $rootScope.$emit('user');*/
		                }, 3000);
		            }).error(function (err) {
		                $scope.uploadInProgress = false;
		                /*console.log('Error uploading user profile image: ' + err.message || err);*/
		            });
		        };
		        
		        $scope.editBranch=function(urlPath,id){		        
		        	   urlPath=urlPath.replace(":branchId",id);
		        	   $location.path(urlPath);
		        };  	
		       
		        $scope.redirectdashboard = function(){
		            $location.path(PROFILE.URL_PATH.DASHBOARD);
		         }
		        
	});

	
