'use strict';
/* jshint -W098 */
angular
		.module('mean.role')
		.controller(
				'FeaturecategoryController',
				function($scope, Global, FeaturecategoryService, $stateParams,
						PROFILE, $location, MESSAGES, $rootScope, ROLE, flash,FeatureService) {
					$scope.global = Global;
					$scope.SERVICE = FeaturecategoryService;
					$scope.PROFILE = PROFILE;
					$scope.MESSAGES = MESSAGES;
					$scope.ROLE=ROLE;
    				$scope.package = {
						name : 'Role',
						modelName: 'Featurecategory',
            			featureName: 'Featurecategories'
					};
					
					initializePagination($scope, $rootScope, $scope.SERVICE);
					initializeDeletePopup($scope,$scope.package.modelName,MESSAGES);
					initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
					initializeBreadCrum($scope,$scope.package.modelName,ROLE.URL_PATH.FEATURECATEGORYLIST);

					$scope.find = function() {
						/*FeaturecategoryService.query(function(featurecategories) {
									$scope.featurecategories = featurecategories;

								});*/
						$scope.currentPage = 1;
				        $scope.currentPageSize = 10; 
				        var query = {};
				        query.page = $scope.currentPage;
				        query.pageSize = $scope.currentPageSize;
				        $scope.loadPagination(query);
					};

					// BreadCrumbs for Feature category
					$scope.loadNewFeaturecategoryForm = function() {
						$scope.breadCrumAdd("List");
					};
				    
				    $scope.createFeaturecategory=function(){
				        $scope.breadCrumAdd("Create");
				    };
				    
				    $scope.editFeaturecategory = function() {
				    $scope.breadCrumAdd("Edit");
				    };
				     
				    $scope.detailFeaturecategory = function() {
				    $scope.breadCrumAdd("Details");
				    };
					
					 $scope.addFeature = function (feature) {
			            var found = false;
			            var foundIndex = -1;
			            for (var i = 0; i < $scope.role.features.length; i++) {
			                if ($scope.role.features[i].feature._id == featureRole.feature._id) {
			                    found = true;
			                    foundIndex = i;
			                }
			            }
			            if (found) {
			                $scope.role.features.splice(foundIndex, 1);
			            } else {
			                $scope.role.features.push(featureRole);
			            }
			        };
					$scope.create = function(isValid) {
						if ($scope.writePermission) {
						if (isValid) {
							console.log($scope.selectedId);
							console.log($rootScope.selectedId);
							$scope.featurecategory.parent = $rootScope.selectedId;
							console.log($scope.featurecategory);
							var featurecategory = new FeaturecategoryService.featurecategory(
									$scope.featurecategory)
							featurecategory.$save(function(response) {
								flash.setMessage(MESSAGES.FEATURECATEGORY_ADD_SUCCESS,
										MESSAGES.SUCCESS);
								$location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
								$scope.featurecategory = {};
							}, function(error) {
								$scope.error = error;
							});
						} else {
							$scope.submitted = true;
						}
					} else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
					};

					$scope.remove = function(Featurecategory) {
						if (Featurecategory && $scope.deletePermission) {
							var featurecategory = new FeaturecategoryService.featurecategory($scope.featurecategory);
							featurecategory.$remove(function(response) {
										for ( var i in $scope.collection) {
											if ($scope.collection[i] === Featurecategory) {
												$scope.collection.splice(i, 1);
											}
										}
										$('#deletePopup').modal("hide");
										flash.setMessage(MESSAGES.FEATURECATEGORY_DELETE_SUCCESS,
												MESSAGES.SUCCESS);
										$location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
									});
						}
						 else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }

					};
					$scope.update = function(isValid) {
						if ($scope.updatePermission) {
						if (isValid) {
							var featurecategory = $scope.featurecategory;
							if (!featurecategory.updated) {
								featurecategory.updated = [];
							}
							featurecategory.updated.push(new Date().getTime());

							featurecategory.$update(function() {
								flash.setMessage(MESSAGES.FEATURECATEGORY_UPDATE_SUCCESS,
										MESSAGES.SUCCESS);
								$location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
							}, function(error) {
								$scope.error = error;
							});
						} else {
							$scope.submitted = true;
						}
						  } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
					};
					$scope.findOne = function() {
						if ($scope.updatePermission) {
						FeaturecategoryService.featurecategory.get({
							featurecategoryId : $stateParams.featurecategoryId
						}, function(featurecategory) {
							$scope.featurecategory = featurecategory;
						});
						} else {
			                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
			                $location.path(MESSAGES.DASHBOARD_URL);
			            }
					};
					$scope.cancelFeaturecategory = function() {
						$location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
					};
					$scope.newFeaturecategory = function(selectedObj) {
						if (selectedObj) {
							$rootScope.selectedId = selectedObj._id;
						}
						$location.path(ROLE.URL_PATH.FEATURECATEGORYCREATE);
					};
					/*$scope.modalDeleteFeaturecategory = function(
							featurecategory) {
						$scope.featurecategory = featurecategory;
						$('#deleteFeaturecategory').modal("show");
					};
					$scope.cancelDelete = function() {
						$('#deleteFeaturecategory').modal("hide");
					};*/
					$scope.redirectdashboard = function() {
						$location.path(PROFILE.URL_PATH.DASHBOARD);
					};
					$scope.featurecategoryDetails = function(featurecategory) {
						$scope.featurecategory = featurecategory;
						$location.path('/admin/featurecategory/'
								+ featurecategory._id + '/details');
					};
					
					 $scope.editFeatureCategory = function (urlPath, id) {
				        urlPath = urlPath.replace(":featurecategoryId", id);
				        $location.path(urlPath);
				    };

				    $scope.featureList = function () {
			            if ($scope.writePermission) {
			            $scope.role = {};
			            $scope.role.features = [];
			            $scope.breadCrumAdd("Create");

			            $scope.features = [];
			            if (angular.isUndefined($rootScope.featureList)) {
			                FeatureService.feature.query(function (features) {
			                    $scope.features = features;
			                    console.log( $scope.features);
			                    //$rootScope.featureList = features;
			                    //$scope.createRoleFeatures();
			                });
			            } else {
			                $scope.features = $rootScope.featureList;
			                //$scope.createRoleFeatures();
			            }
			                 } else {
			                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
			                $location.path(MESSAGES.DASHBOARD_URL);
			            }
        			};
				});