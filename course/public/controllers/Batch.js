'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('BatchController', function($scope, $stateParams, Global, BATCHService, $location, $rootScope, COURSE, flash, MESSAGES, $timeout) {
    $scope.global = Global;
    $scope.package = {
        name: 'Course',
        modelName: 'Batch',
        featureName: 'Batches'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    $scope.batch = {};
    initializeBreadCrum($scope, $scope.package.name, COURSE.URL_PATH.ADMIN_COURSE_LIST);
    initializePagination($scope, $rootScope, BATCHService);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES);
    $scope.hasAuthorization = function(batch) {
        if (!batch || !batch.user) {
            return false;
        }
        return MeanUser.isAdmin || batch.user._id === MeanUser.user._id;
    };
    $scope.listBreadcrumb = function() {
        if($scope.readPermission){
        $scope.cobj = $rootScope.courseobj;
        $scope.courseId = $rootScope.courseobj._id
        $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        $scope.breadCrumAppend("List");
        }
        else{
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.create = function(urlPath, isValid) {
        $scope.courseId = $rootScope.courseobj._id;
        var coursesId = $rootScope.courseobj._id;
        if ($scope.writePermission) {
            if (isValid) {
                $scope.batch.course = $scope.courseId;
                var batch = new BATCHService.batch($scope.batch);
                $scope.breadCrumAdd("Create");
                batch.$save(function(response) {
                    urlPath = urlPath.replace(":courseId", coursesId);
                    flash.setMessage(MESSAGES.BATCH_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(urlPath);
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
    $scope.remove = function(Batch) {
        if (Batch && $scope.deletePermission) {
            var Batch = new BATCHService.batch(Batch);
            Batch.$remove(function(response) {
                deleteObjectFromArray($scope.collection, Batch);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.BATCH_DELETE_SUCCESS, MESSAGES.SUCCESS);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.update = function(urlPath, isValid) {
        var coursesId = $rootScope.courseobj._id;
        if ($scope.updatePermission) {
            if (isValid) {
                var batch = $scope.batch;
                if (!batch.updated) {
                    batch.updated = [];
                }
                batch.updated.push(new Date().getTime());
                batch.$update(function() {
                    urlPath = urlPath.replace(":courseId", coursesId);
                    flash.setMessage(MESSAGES.BATCH_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(urlPath);
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.newBatch = function() {
        $location.path('/admin/batch/create');
    }
    $scope.cancel = function(urlPath) {
        urlPath = urlPath.replace(":courseId", $rootScope.courseobj._id);
        $location.path(urlPath);
    }
    $scope.branchesBasedOnCourse = function() {
        $scope.cobj = $rootScope.courseobj;
        $scope.courseId = $rootScope.courseId;
        BATCHService.branchCourses.query({
            courseId: $scope.courseId
        }, function(branches) {
            $scope.branches = branches;
        });
    }
    $scope.findOne = function() {
        $scope.branchesBasedOnCourse();
        if ($scope.updatePermission) {
            BATCHService.batch.get({
                batchId: $stateParams.batchId
            }, function(batch) {
                $scope.batch = batch;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.editbatch = function(urlPath, id) {
        urlPath = urlPath.replace(":batchId", id);
        $location.path(urlPath);
    };
    $scope.createBatchBreadCrumbs = function() {
        $scope.breadCrumAdd("Create");
    };
    $scope.editBatchBread = function() {
        $scope.courseId = $rootScope.courseobj._id
        $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        $scope.breadCrumAppend("Edit");
    };
    $scope.viewBatchBread = function() {
        $scope.courseId = $rootScope.courseobj._id
        $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        $scope.breadCrumAppend("View");
    };
    $scope.timeinhrs = [{
        option: '00',
        value: '00'
    }, {
        option: '01',
        value: '01'
    }, {
        option: '02',
        value: '02'
    }, {
        option: '03',
        value: '03'
    }, {
        option: '04',
        value: '04'
    }, {
        option: '05',
        value: '05'
    }, {
        option: '06',
        value: '06'
    }, {
        option: '07',
        value: '07'
    }, {
        option: '08',
        value: '08'
    }, {
        option: '09',
        value: '09'
    }, {
        option: '10',
        value: '10'
    }, {
        option: '11',
        value: '11'
    }, {
        option: '12',
        value: '12'
    }, {
        option: '13',
        value: '13'
    }, {
        option: '14',
        value: '14'
    }, {
        option: '15',
        value: '15'
    }, {
        option: '16',
        value: '16'
    }, {
        option: '17',
        value: '17'
    }, {
        option: '18',
        value: '18'
    }, {
        option: '19',
        value: '19'
    }, {
        option: '20',
        value: '20'
    }, {
        option: '21',
        value: '21'
    }, {
        option: '22',
        value: '22'
    }, {
        option: '23',
        value: '23'
    }];
    $scope.timeinmins = [{
        option: '00',
        value: '00'
    }, {
        option: '15',
        value: '15'
    }, {
        option: '30',
        value: '30'
    }, {
        option: '45',
        value: '45'
    }];
    $scope.batch.batchSchedule = {};
    $scope.batch.batchSchedule.mon = [{}];
    $scope.batch.batchSchedule.tue = [{}];
    $scope.batch.batchSchedule.wed = [{}];
    $scope.batch.batchSchedule.thu = [{}];
    $scope.batch.batchSchedule.fri = [{}];
    $scope.batch.batchSchedule.sat = [{}];
    $scope.batch.batchSchedule.sun = [{}];
    $scope.addbatchtimingsrow = function(timeArray) {
        timeArray.push({});
    };
    $scope.removebatchtimingsrow = function(index, timeArray) {
        timeArray.splice(index, 1);
    };
    $scope.checkError = function(start_date) {
        $scope.Lesserstartvalue = false;
        var curDate = new Date();
        $scope.start_date = $scope.batch.start_date;
        if ($scope.start_date < curDate) {
            $scope.Lesserstartvalue = true;
            $timeout(function() {
                $scope.Lesserstartvalue = false;
            }, 6000);
        } else {
            $scope.Lesserstartvalue = false;
        }
    };
    $scope.formatTime = function(day, index) {
        $scope.timeCalculation = [];
        if (day[index].startHH && day[index].startMM && day[index].endHH && day[index].endMM) {
            day[index].start_time = (day[index].startHH + ":" + day[index].startMM + ": 00");
            day[index].end_time = (day[index].endHH + ":" + day[index].endMM + ": 00");
            var m = moment(day[index].start_time, moment.ISO_8601);
            m.format('HH:mm:ss');
            var m1 = moment(day[index].end_time, moment.ISO_8601);
            m1.format('HH:mm:ss');
            day.dateErr = false;
            $scope.timeCalculation.push(m1._i);
            if (m1._i > m._i) {
                day.dateErr = false;
            } else {
                day.dateErr = true;
            }
        }
        $rootScope.courseId = $stateParams.courseId;
    };
    $scope.branchFilter = function(branchId) {
        $scope.batch.branch = branchId;
    };
    $scope.listBatches = function() {
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        query.course = $stateParams.courseId;
        $scope.loadPagination(query);
    }
    $scope.batchList = function(urlPath, course) {
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };
});