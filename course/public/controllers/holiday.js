'use strict';

angular
		.module('mean.course')
		.controller(
				'HolidayController',
				[
						'$scope',
						'$stateParams',
						'Global',
						'HolidayService',
						'$location',
						'$rootScope',
						'MESSAGES',
						'flash',
						'COURSE',
						'MeanUser',
						'CountryService',
						'BranchService',
						function($scope, $stateParams, Global, HolidayService,
								$location, $rootScope, MESSAGES, flash, COURSE,
								MeanUser, CountryService, BranchService) {
							$scope.global = Global;
							$scope.test = '';
							$scope.MESSAGES = MESSAGES;
							$scope.COURSE = COURSE;
							$scope.SERVICE = HolidayService;
							$scope.package = {
								name : 'holiday',
								modelName : 'Holiday',
								featureName : 'Holidays'
							};
							$scope.isCountry = false;
							$scope.isBranch = false;
							initializeDeletePopup($scope,
									$scope.package.modelName, MESSAGES);
							initializeBreadCrum($scope,
									$scope.package.modelName,
									COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
							initializePagination($scope, $rootScope,
									$scope.SERVICE);
							initializePermission($scope, $rootScope, $location,
									flash, $scope.package.featureName, MESSAGES);

							// find the holiday by holiday id
							$scope.findOne = function() {
								if ($scope.updatePermission) {
									HolidayService.holiday.get({
										holidayId : $stateParams.holidayId
									}, function(holiday) {
										$scope.holiday = holiday;
									});
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							// create the holiday
							$scope.create = function(isvalid) {
								if ($scope.writePermission) {
									if (isvalid) {
										var holiday = new HolidayService.holiday(
												$scope.holiday);
										holiday
												.$save(
														function(response) {
															flash
																	.setMessage(
																			MESSAGES.HOLIDAY_ADD_SUCCESS,
																			MESSAGES.SUCCESS);
															$location
																	.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
															$scope.holiday = {};
														},
														function(error) {
															$scope.error = error;
														});

									} else {
										$scope.submitted = true;
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							// update the holiday

							$scope.update = function(isvalid) {
								if ($scope.updatePermission) {
									if (isvalid) {
										var holiday = $scope.holiday;
										if (!holiday.updated) {
											holiday.updated = [];
										}
										holiday.updated.push(new Date()
												.getTime());

										holiday
												.$update(
														function() {
															flash
																	.setMessage(
																			MESSAGES.HOLIDAY_UPDATE_SUCCESS,
																			MESSAGES.SUCCESS);
															$location
																	.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
														},
														function(error) {
															$scope.error = error;
														});
									} else {
										$scope.submitted = true;
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							$scope.remove = function(Holiday) {
								if (Holiday && $scope.deletePermission) {
									if (Holiday) {
										var holiday = new HolidayService.holiday(
												Holiday);
										holiday
												.$remove(function(response) {
													for ( var i in $scope.collection) {
														if ($scope.collection[i] === Holiday) {
															$scope.collection
																	.splice(i,
																			1);
														}
														$('#deletePopup')
																.modal("hide");
														flash
																.setMessage(
																		MESSAGES.HOLIDAY_DELETE_SUCCESS,
																		MESSAGES.SUCCESS);
														$location
																.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
													}
												});
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							/*
							 * Cancel the holiday
							 */
							$scope.cancelHoliday = function() {
								$location
										.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
							};

							$scope.editholiday = function(urlPath, id) {
								urlPath = urlPath.replace(":holidayId", id);
								$location.path(urlPath);
							};
							$scope.newHoliday = function() {
								$location
										.path(COURSE.URL_PATH.ADMIN_HOLIDAY_CREATE);
							};
							$scope.createHoliday = function() {
								$scope.breadCrumAdd("Create");
							};
							$scope.editHoliday = function() {
								$scope.breadCrumAdd("Edit");
							};

							$scope.filter = function() {
								$scope.user = MeanUser.user;
								if ($scope.user.branch.length <= 0) {
									if ($scope.user.country.length <= 0) {
										flash.setMessage(
												MESSAGES.PERMISSION_DENIED,
												MESSAGES.ERROR);
										$location.path(MESSAGES.DASHBOARD_URL);
									} else {
										$scope.countries = $scope.user.country;
										$scope.isCountry = true;
										$scope.isBranch = false;
									}
								} else {
									$scope.branches = $scope.user.branch;
									$scope.isCountry = false;
									$scope.isBranch = true;

								}
							};

							$scope.checkErr = function(start_date, end_date) {
								$scope.holidayForm.end_date.$error.Lesservalue = false;
								var holiday = $scope.holiday;
								$scope.start_date = holiday.start_date;
								$scope.end_date = holiday.end_date;
								if ($scope.start_date > $scope.end_date) {
									$scope.holidayForm.end_date.$error.Lesservalue = true;
								} else {
									$scope.holidayForm.end_date.$error.Lesservalue = false;
								}

							};
							$scope.checkError = function(start_date) {
								$scope.holidayForm.end_date.$error.Lesserstartvalue = false;
								var curDate = new Date();
								var holiday = $scope.holiday;
								$scope.start_date = holiday.start_date;

								if ($scope.start_date < curDate) {
									$scope.holidayForm.end_date.$error.Lesserstartvalue = true;

								} else {
									$scope.holidayForm.end_date.$error.Lesserstartvalue = false;
								}
							};
						} ]);