angular.module('mean.course').controller('AttendanceController', function($scope, $stateParams, Global, AttendanceService, $location, $rootScope, COURSE, flash, MESSAGES,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'Course',
        modelName: 'Batch',
        featureName: 'Batches'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.PATH.ADMIN_BATCH_LIST,'Attendance','Course Management');
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    $scope.hidemyattendance=0;
    $scope.liststudents = function() {
        if ($scope.updatePermission) {
            AttendanceService.attendance.get({
                batchId: $stateParams.batchId
            }, function(batch) {
                $scope.batch = batch;
                for (var i = 0; i < $scope.batch.students.length; i++) {
                   $scope.batch.students[i].attended = true;
                }
                for (var j = 0; j < $scope.batch.schedule.length; j++) {
                    var newStartDate = $scope.batch.schedule[j].startDate.split("-");
                    var newEndDate = $scope.batch.schedule[j].endDate.split("-");
                    $scope.events2.push({
                        title: $scope.batch.batch_name,
                        start: new Date(newStartDate[0],newStartDate[1]-1,newStartDate[2]),
                        end: new Date(newEndDate[0],newEndDate[1]-1,newEndDate[2]),
                        stick: true
                    });
                }
            }, function(error) {
                console.log(error);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.saveattendance = function() {
        $scope.batch.date = $scope.eventdate;
        var attendance = new AttendanceService.batchattendance($scope.batch);
        attendance.$save(function(response) {
            flash.setMessage(MESSAGES.ATTENDANCE_ADD_SUCCESS);
            $scope.hidemyattendance=0;
            for (var i = 0; i < $scope.batch.students.length; i++) {
                   $scope.batch.students[i].attended = true;
                }
        }, function(error) {
            $scope.error = error;
        });
        $scope.submitted = true;
    };
    $scope.updateattendance = function() {
        $scope.attendanceupdatedetails = {};
        $scope.attendanceupdatedetails.batch_id = $stateParams.batchId;
        $scope.attendanceupdatedetails.attendance = $scope.hasattendance;
        $scope.attendanceupdatedetails.date = $scope.eventdate;
        AttendanceService.batchattendance.update($scope.attendanceupdatedetails, function(response) {
            flash.setMessage(MESSAGES.ATTENDANCE_UPDATE_SUCCESS);
            $scope.hidemyattendance=0;
            $scope.showheadercomment=false;
        }, function(error) {
            $scope.error = error;
        });
    };
    $scope.calendereventclick = function(date, jsEvent, view) {
     if(date.start._i > new Date())
     {
         flash.setMessage(MESSAGES.ATTENDANCE_EVENT_ERROR,MESSAGES.ERROR);
         $scope.hidemyattendance=0;
     }
     else
     { 
        $scope.attendancedate=date.start._i;
        var dd = $scope.attendancedate.getDate();
        var mm = $scope.attendancedate.getMonth()+1; //January is 0!
        var yyyy = $scope.attendancedate.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 
        $scope.attendancedate = mm+'/'+dd+'/'+yyyy;
        $scope.hidemyattendance=1;
        $scope.showheadercomment=false;
        $scope.eventdate = date.start._i;
        AttendanceService.batchattendance.query({
            batch_id: $stateParams.batchId,
            date: $scope.eventdate
        }, function(response) {
            $scope.hasattendance = response;
            if (response.length > 0) {
                $scope.Batchname = response[0].batch_id.batch_name;
            }
        });
      }  
    };
    $scope.cancelattendance=function()
    {
      $scope.hidemyattendance=0;
    };
    $scope.addcomment=function(studentObj){
        $scope.showheadercomment = true;
        studentObj.addcomment = true;
    };
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.uiConfig = {
        calendar: {
            height: 400,
            editable: true,
            header: {
                left: 'title',
                right: 'today prev,next'
            },
            eventClick: $scope.calendereventclick,
            eventDrop: $scope.alertOnDrop,
            displayEventTime: false
        }
    };
    $scope.events2 = [];
    $scope.eventSources = [$scope.events2];
    $scope.listPage = function(urlPath){
        var id = $scope.batch.course._id;
        urlPath = urlPath.replace(":courseId", id);
        $location.path(urlPath);
    };
    $scope.attendanceBreadcrumb = function(){
        $scope.breadCrumAdd("Attendance");
    };
});