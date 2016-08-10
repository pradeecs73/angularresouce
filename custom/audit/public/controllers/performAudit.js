(function() {
    'use strict';
    /* jshint -W098 */
    /**
     * Name : PerformAuditController @ <author> Sanjana @ <date> 12-july-2016 @ METHODS:
     * find
     */

    angular.module('mean.audit').controller('PerformAuditController', PerformAuditController);
    PerformAuditController.$inject = ['$scope', 'Global', 'AuditService', '$stateParams', '$location', 'AUDIT', 'utilityService', 'MeanUser'];

    function PerformAuditController($scope, Global, AuditService, $stateParams, $location, AUDIT, utilityService, MeanUser) {
        $scope.global = Global;
        $scope.package = {
            name: 'audit'
        };
        $scope.user = MeanUser.user;
        $scope.performAuditMaster = {};
        $scope.performAuditMaster.responses = [];
        $scope.pageNo = 1;
        $scope.task = {};

        /**
         * findAll audit questions with pagination implemented
         */
        $scope.find = function() {
            AuditService.performAuditQuestions.get({
                auditId: $stateParams.auditId
            }, function(performAuditQuestions) {
                $scope.totalAuditQues = performAuditQuestions;
                $scope.performAuditQuestions = performAuditQuestions;
                var performAuditArray = {};
                performAuditArray.responses = [];
                for (var i = 0; i < performAuditQuestions.questions.length; i++) {
                    var data = {
                        'question': performAuditQuestions.questions[i].audit_question,
                        'sequence': performAuditQuestions.questions[i].sequence
                    }
                    performAuditArray.responses.push(data)
                }
                $scope.performAuditMaster = performAuditArray;
                $scope.pageLoad();
            });
        };

        /**
         * perform new audit
         * 
         * @params {isValid} check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.performAuditQuestions = [];
                for (var i = 0; i < $scope.performAuditMaster.responses.length; i++) {
                    if ($scope.performAuditMaster.responses[i].answer == undefined) {
                        $scope.performAuditQuestions.push($scope.performAuditMaster.responses[i].sequence);
                    }
                }
                if ($scope.performAuditQuestions.length > 0) {
                    var title = "Questions Not Answered";
                    var message = "Please answer these questions!" + " " + $scope.performAuditQuestions;
                    utilityService.dialog(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = AUDIT.URL_PATH.PERFORMAUDIT;
                    });
                } else {
                    var performNewAudit = new AuditService.performAuditQuestions($scope.performAuditMaster);
                    performNewAudit.$save({
                        auditId: $stateParams.auditId
                    }, function(response) {
                        $location.path(AUDIT.PATH.AUDITLIST);
                        utilityService.flash.success("Audit Performed Successfully");
                    }, function(error) {
                        $scope.error = error;
                    });
                }
            } else {
                $scope.performAuditQuestions = [];
                for (var i = 0; i < $scope.performAuditMaster.responses.length; i++) {
                    if ($scope.performAuditMaster.responses[i].answer == undefined) {
                        $scope.performAuditQuestions.push($scope.performAuditMaster.responses[i].sequence);
                    }
                }
                var title = "Questions Not Answered";
                var message = "Please answer these questions!" + " " + $scope.performAuditQuestions;
                utilityService.dialog(title, message, function() {
                    //TODO: this will completely reload the window & need to find a better solution later
                    $window.location.href = AUDIT.URL_PATH.PERFORMAUDIT;
                });
                $scope.submitted = true;
            }
        };

        /**
         * clicking the prev(pagination)
         * 
         */
        $scope.prev = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + ($scope.pageNo - 1)).addClass('active');
            $scope.pageNo = $scope.pageNo - 1;
        };

        /**
         * clicking the next(pagination)
         * 
         */
        $scope.next = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + ($scope.pageNo + 1)).addClass('active');
            $scope.pageNo = $scope.pageNo + 1;
        };

        /**
         * clicking the close button of the modal resetting the radio button
         * 
         */
        $scope.resetRadio = function() {
            if ($("#Choose_no" + $scope.selectedRadio).prop("checked")) {
                $("#Choose_no" + $scope.selectedRadio).prop('checked', false);
            }
        };

        /**
         * setting the index to the scope variable used for resetting the radio button
         * 
         */
        $scope.radioChecked = function(index) {
            $scope.selectedRadio = index;
        }
        
        /**
         * getting the total page numbers
         * 
         */

        $scope.pageLoad = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + $scope.pageNo).addClass('active');

            $scope.pageNos = [];
            $scope.pageNums = [];
            var pageNum = Math.round($scope.performAuditMaster.responses.length / 5);
            $scope.pageNumRound = pageNum % 5;
            if ($scope.pageNumRound < 5) {
                $scope.pageNumNew = $scope.pageNumRound;
            } else {
                $scope.pageNumNew = $scope.pageNumRound + 1;
            }
            for (var i = $scope.pageNumNew; i >= 1; i--) {
                $scope.pageNums.push(i);
            }
            $scope.pageNums.reverse();
            $scope.pageNos = $scope.pageNums;
        };

        /**
         * clicking the current page 
         * @params :pageNo
         */
        $scope.currentPage = function(pageNo) {
            $scope.pageNo = pageNo;
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + $scope.pageNo).addClass('active');
        };

        $scope.cancel = function() {
            var urlPath = AUDIT.PATH.AUDITLISTBACK;
            var locationId = $scope.performAuditQuestions.audit.location._id;
            var buildingId = $scope.performAuditQuestions.audit.building._id;
            urlPath = urlPath.replace(":locationId", locationId).replace(":buildingId", buildingId);
            $location.path(urlPath);
        };


        $scope.createTask = function(isValid) {
            var err = true;
            if (!$scope.task.directly) {
                if (!$scope.task.fixday) {
                    err = false;
                    $scope.radioErr = true;
                }
            }
            if (isValid && err) {
                if ($scope.task.directly) {
                    $scope.task.responsible = $scope.user;
                    $scope.task.responsible_followUp = $scope.user;
                }
                var task = new AuditService.task($scope.task);
                task.building = $scope.performAuditQuestions.audit.building._id;
                task.name = task.name + "(" + $scope.performAuditQuestions.audit.name +")" + "(" + $scope.performAuditQuestions.audit.audit_category.name + ")";
                task.$save(function(response) {
                    $scope.performAuditMaster.responses[$scope.currentQuestionIndex].security_task = response.security_task;
                    $scope.task = {};
                    $('#myModal').modal('hide');
                    $scope.submitted1 = false;
                    $scope.radioErr = false;
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted1 = true;
            }
        };

        $scope.setQuestion = function(qi) {
            $scope.submitted1 = false;
            $scope.radioErr = false;
            $scope.currentQuestionIndex = qi;
        }

        $scope.loadUsers = function() {
            AuditService.fetchUsers.query({buildings:$scope.performAuditQuestions.audit.building._id},function(users) {
                $scope.userResponsible = users;
                $scope.userFollowUp = users;
            });
        };

        $scope.removeErr = function() {
            $scope.radioErr = false;
        };

    }

})();
