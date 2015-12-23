'use strict';

/* jshint -W098 */
angular.module('mean.skill').controller('BadgeController',
	function($scope, Global, BadgeService, $stateParams, $location,$rootScope,PROFILE, SkillService) {
					$scope.PROFILE = PROFILE;
					$scope.global = Global;
					$scope.package = {
						name : 'badge'
					};
					$scope.findSkill = function() {
						SkillService.skill.query(function(skills) {
							$scope.skills = skills;
						});
					};
					$scope.find = function() {
						BadgeService.query(function(badges) {
							$scope.badges = badges;
						});
					};
					$scope.create = function(isValid) {
						if (isValid) {
							var badge = new BadgeService($scope.badge);
							badge.$save(function(response) {
								$location.path('/badges');
								$scope.badge = {};
							},function(error){
								$scope.error= error;
							});
						} else {
							$scope.submitted = true;
						}

					};

					$scope.remove = function(Badge) {
						if (Badge) {
							Badge.$remove(function(response) {
								for ( var i in $scope.badges) {
									if ($scope.badges[i] === Badge) {
										$scope.badges.splice(i, 1);
									}
								}
								$location.path('/badges');
								$('#deleteBadge').modal("hide");
							});
						} else {
							$scope.badge.$remove(function(response) {
								$location.path('/badges');
								$('#deleteBadge').modal("hide");
							});
						}
					};

					$scope.update = function(isValid) {
						if (isValid) {
							var badge = $scope.badge;
							if (!badge.updated) {
								badge.updated = [];
							}
							badge.updated.push(new Date().getTime());

							badge.$update(function() {
								$location.path('/badges');
							},function(error){
								$scope.error= error;
							});
						} else {
							$scope.submitted = true;
						}
					};
					$scope.findOne = function() {
						BadgeService.get({
							badgeId : $stateParams.badgeId
						}, function(badge) {
							$scope.badge = badge;
						});
					};
					$scope.cancelBadge = function() {
						$location.path('/badges');
					};
					$scope.newBadge = function() {
						$location.path('/badge/create');
					};
					$scope.modalDeleteBadge = function(badge){          
						$scope.badge = badge;
		            $('#deleteBadge').modal("show");
			        };
			      
			         $scope.canceldelete = function(){
			            $('#deleteBadge').modal("hide");
			         };
			         $scope.redirectdashboard = function(){
				           $location.path(PROFILE.URL_PATH.DASHBOARD);
				     }
				});