'use strict';

/* jshint -W098 */
angular.module('mean.course').controller('CourseBranchController',
	function($scope, $rootScope, $stateParams, $location, Global, MeanUser, MESSAGES, flash, COURSE, CountryService, ZoneService, CityService, BranchService, CoursesService, CourseBranchService) {
			$scope.global = Global;
			$scope.package = {
				name : 'course',
	            modelName: 'Course'
			};
			
			$scope.isBranchSelected = false;
			$scope.title = 'Select Branch';
			$scope.message = 'Select any branch to assign course.';
			
			$scope.MESSAGES = MESSAGES;
			
			//************** Initializing Delete Pop-up **************//
	        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES);
			
			//************** Initializing BreadCrumb **************//
			initializeBreadCrum($scope, $scope.package.modelName);

	        $scope.courseBreadcrumb = function(){
	        	$scope.breadCrumAdd("Course Assignment");
	        };
	        
	        $scope.loadBranches = function() {
	        	$scope.user = MeanUser.user;
	        	if($scope.user.branch.length > 0){
	        		$scope.branches = $scope.user.branch;
	        	}
	        }
	        
	        $scope.assignedBranch = function (){
	        	if(angular.isUndefined($rootScope.branchObj)){
	        		$scope.loadBranches();
	        	} else {
	        		$scope.loadBranches();
		        	$scope.loadSelectedCourse();
	        	}
	        }
	        
	        //fetching the list of branches based on city
	        $scope.listBranches = function (cityId) {
	        	if(angular.isUndefined($rootScope.branchObj)){
		            BranchService.all.query({}, function (branches) {
		                $scope.branches = branches;
		            });
	        	} else {
		            BranchService.all.query({}, function (branches) {
		                $scope.branches = branches;
		            });
		            console.log($scope.branches);
	        		$scope.loadSelectedCourse();
	        	}
	        };
	        
	        $scope.branchFilter = function (branchId) {
	        	$scope.branchId = branchId;
	            $scope.branchObj = {};
	            $rootScope.$emit('processingContinue');
	            BranchService.branch.get({
	                branchId: branchId
	            }, function (branch) {
	                $rootScope.$emit('processingDone');
	                $rootScope.branchObj = branch;
	                $scope.selectedCourses = $rootScope.branchObj.course;
	                if($rootScope.branchObj){
	                	$scope.isBranchSelected = true;
	                }
	                $scope.disablingAssign();
	            }); 
	        };
	        
	        //************** Load Available Courses **************//
			$scope.loadAvailableCourse = function(){
				CoursesService.page.query({}, function (courses) {
	                $rootScope.$emit('processingDone');
	                $scope.availableCourses = courses;
	            });
			};
			
			//************** Load Selected Courses **************//
			$scope.loadSelectedCourse = function(){
				$scope.branchFilter($rootScope.branchObj._id);
			};
			
			//************** Assign course to a branch **************//
			$scope.assign = function(courseId){
				if(angular.isUndefined($rootScope.branchObj)){
					$('#branchSelectPopup').modal("show");
				} else {
					console.log(courseId);
					console.log(COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME);
					console.log(COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME.replace(':courseId', courseId));
					$location.path(COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME.replace(':courseId', courseId));
				}
			};
			
			$scope.ok = function(){
				$('#branchSelectPopup').modal("hide");
			}
			
			//************** Disable assign button for course to a branch **************//
			$scope.disablingAssign = function(){
				if(angular.isDefined($rootScope.branchObj)){
                	$scope.branchObj = $rootScope.branchObj;
                	for(var i = 0; i < $scope.branchObj.course.length; i++){
	                	for(var j = 0; j < $scope.availableCourses.length; j++){
	                		if(JSON.stringify($scope.availableCourses[j]._id) === JSON.stringify($scope.branchObj.course[i]._id)){
	                			$scope.availableCourses[j].assigned = true;
	                		}
	                	}
	                }
                }
			};
			
			//************** Remove course from a branch **************//
			$scope.remove = function(courseId){
				CourseBranchService.paymentScheme.get({
					branchId: $rootScope.branchObj._id,
					courseId: courseId
				}, function (response) {
                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
                    $rootScope.branchObj = response;
                    $scope.selectedCourses = response.course;
                    for(var i = 0; i < $scope.availableCourses.length; i++){
                    	if(JSON.stringify($scope.availableCourses[i]._id) === JSON.stringify(courseId)){
                			$scope.availableCourses[i].assigned = false;
                		}
                    }
                    //$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
                }, function (error) {
                    $scope.error = error;
                });
			};
			
			//************** Assigning payment scheme for a course **************//
			$scope.submit = function (){
				$scope.coursePaymentSchemeBranch = $rootScope.branchObj;
				$scope.courseId = $stateParams.courseId;
				$scope.coursePaymentSchemeBranch.course.push($scope.courseId);
				$scope.coursePaymentSchemeBranch.coursePaymentSchemes = $scope.course.paymentSchemes;
				var branch = new CourseBranchService.paymentScheme($scope.coursePaymentSchemeBranch);
				console.log(branch);
				branch.$update({
					branchId: $scope.coursePaymentSchemeBranch._id,
					courseId: $scope.courseId
				}, function (response) {
                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
    				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
                }, function (error) {
                    $scope.error = error;
                });
			};
			
			$scope.cancel = function(){
				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
			};
					
			//************** Generate Label **************//
			$scope.getLabel = function(index){
				if(index == 0){
					return 'Down Payment';
				} else {
					return 'Installment';
				}
			};
			
			//************** Initialize payment scheme **************//
			$scope.intializeNewPaymentScheme = function(){
				$scope.course = {};
				$scope.course.paymentSchemes = [];
				$scope.intializePaymentScheme();
				$scope.course.paymentSchemes.push($scope.paymentScheme);
				console.log($scope.course);
			};
			
			//************** Initialize installment **************//
			$scope.intializePaymentScheme = function(){
				$scope.paymentScheme = {};
				$scope.paymentScheme.installments = [{},{}];
				for(var i = 0; i < 2; i++){
					$scope.paymentScheme.installments[i].discounts = [{}];
					if(i == 0){
						$scope.paymentScheme.installments[i].paymentFor = 'Down Payment';
					} else {
						$scope.paymentScheme.installments[i].paymentFor = 'Installment '+(i);
					}
				}
			};
			
			//************** Add and Remove Payment Scheme **************//
			$scope.addPaymentScheme = function() {
				$scope.intializePaymentScheme();
				$scope.course.paymentSchemes.push($scope.paymentScheme);
			};
			
			$scope.removePaymentScheme = function(paymentScheme){
				var i = $scope.course.paymentSchemes.indexOf(paymentScheme);
				$scope.course.paymentSchemes.splice(i, 1);
			};
			
			//************** Add and Remove Installment **************//
			$scope.addInstallment = function() {
				$scope.paymentScheme.installments.push({});
				$scope.paymentScheme.installments[$scope.paymentScheme.installments.length - 1].discounts = [{}];
			};
			
			$scope.removeInstallment = function(installment) {
				var i = $scope.paymentScheme.installments.indexOf(installment);
				$scope.paymentScheme.installments.splice(i, 1);
			};
			
			//************** Add and Remove Discount **************//
			$scope.addDiscount = function(index) {
				$scope.paymentScheme.installments[index].discounts.push({});
			};
			
			$scope.removeDiscount = function(discount, index) {
				var i = $scope.paymentScheme.installments[index].discounts.indexOf(discount);
				$scope.paymentScheme.installments[index].discounts.splice(i, 1);
			};			
	});
