(function() {
    'use strict';
    /* jshint -W098 */
    /** Name : ExternalTaskController
     * @ <author> Sanjana 
     * @ <date> 27-july-2016
     * @ METHODS: create, update, findOne, approveOrdeclinetask,approvalOfEstimates
     */

    angular.module('mean.securitytasks').controller('ExternalTaskController', ExternalTaskController);
    ExternalTaskController.$inject = ['$scope', 'Global', 'SecurityTasksService', '$stateParams', 'utilityService', '$location', 'SECURITYTASKS'];

    function ExternalTaskController($scope, Global, SecurityTasksService, $stateParams, utilityService, $location, SECURITYTASKS) {
        $scope.global = Global;
        $scope.package = {
            name: 'securitytasks'
        };
        $scope.subMittedForm = false;
        $scope.submittedStatus = false;
        $scope.submittedApprovedForm = true;
        $scope.disabledData = false;

        /**
         * create new externalsecuritytask
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.externalsecuritytask.company_id = $stateParams.companyId;
                var title = "Estimation of Task";
                var message = "Do you want external user to estimate this task?";
                var onClickYes = function() {
                    var externalsecuritytask = new SecurityTasksService.externalSecurityTaskCreate($scope.externalsecuritytask);
                    externalsecuritytask.value = "Yes";
                    externalsecuritytask.$save(function(response) {
                        utilityService.flash.success('Mail has been sent. Please check!');
                        $location.path(SECURITYTASKS.URL_PATH.SECURITYTASKS_LIST);
                        $scope.externalsecuritytask = {};
                    }, function(error) {
                        $scope.error = error;
                    });
                };
                var onClickCancel = function() {
                    var externalsecuritytask = new SecurityTasksService.externalSecurityTaskCreate($scope.externalsecuritytask);
                    externalsecuritytask.value = "Cancel";
                    externalsecuritytask.$save(function(response) {
                        utilityService.flash.success('Mail has been sent. Please check!');
                        $location.path(SECURITYTASKS.URL_PATH.SECURITYTASKS_LIST);
                        $scope.externalsecuritytask = {};
                    }, function(error) {
                        $scope.error = error;
                    });
                };
                utilityService.genericConfirm(title, message, onClickYes, onClickCancel)
            } else {
                $scope.submitted = true;
            }
        };


        /**
         * update particular external task
         *  @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
            if (isValid) {
                var externalsecuritytask = $scope.externalsecuritytask;
                externalsecuritytask.updatedAt = new Date();
                externalsecuritytask.$update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId
                }, function(err) {
                    
                });
            } else {
                $scope.submitted = true;
            }
        };


        /**
         * findOne particular esternal security task
         */
        $scope.findOne = function() {
            SecurityTasksService.externalSecurityTask.get({
                externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                companyId: $stateParams.companyId
            }, function(externalsecuritytask) {
                $scope.externalsecuritytask = externalsecuritytask;
                if (externalsecuritytask.status !== 'APPROVED' && externalsecuritytask.status !== 'DECLINE'){
                    $scope.status = 'Request is being processed, please wait.'
                } else
                if (externalsecuritytask.status === 'APPROVED'){
                    $scope.status = 'Request has been accepted.';
                    $scope.statusForManager = 'Request has been accepted.';
                    if (externalsecuritytask.actual_cost && externalsecuritytask.actual_hours){
                        $scope.disabledData = true;
                    }
                } else
                if (externalsecuritytask.status === 'DECLINE'){
                    $scope.status = 'Request has been declined.';
                    $scope.statusForManager = 'Request has been declined.';
                }
                if (externalsecuritytask.status == 'DECLINE' || externalsecuritytask.status == 'APPROVED') {
                    $scope.submittedStatus = true;
                }
                if (externalsecuritytask.status == 'FOR_ESTIMATE') {
                    $scope.submittedStatus = true;
                    $scope.statusForManager = "Waiting update from external person"
                }
                if (externalsecuritytask.status == 'COMPLETED') {
                    $scope.submittedStatus = true;
                    $scope.statusForManager = "External Task completed successfully"
                    $scope.status = "External Task completed successfully"
                }
            });
        };

        /**
         * To approve or decline a particular external task after entering the estimations
         */
        $scope.approveOrdeclinetask = function(isValid, status) {
            if (isValid) {
                SecurityTasksService.externalTaskApprove.update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId,
                    externalsecuritytask_hours: $scope.externalsecuritytask.actual_hours,
                    externalsecuritytask_cost: $scope.externalsecuritytask.actual_cost,
                    externalsecuritytask_status: status
                }, function(response) {
                    $scope.subMittedForm = true;
                    $scope.submittedApprovedForm = false;
                    $scope.submittedStatus = true;
                    if (status === 'APPROVED') {
                        $scope.statusForManager = 'Request has been accepted.';
                    } else
                    if (status === 'DECLINE'){
                        $scope.statusForManager = 'Request has been declined.';
                    } else
                    if (status === 'COMPLETED') {
                        $scope.statusForManager = 'External task completed successfully.';
                        if (angular.isUndefined($scope.externalsecuritytask)) {
                            $scope.externalsecuritytask = {};
                        }
                        $scope.externalsecuritytask.status = 'COMPLETED';
                    }
                }, function(err){
                    if (err){
                        $scope.error = err;
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };


        /**
         * To send the external task for approval
         */
        $scope.approvalOfEstimates = function(isValid) {
            if (isValid) {
                SecurityTasksService.approvalExternalTask.update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId,
                    externalsecuritytask_hours: $scope.externalsecuritytask.estimated_hours,
                    externalsecuritytask_cost: $scope.externalsecuritytask.estimated_cost,
                    externalsecuritytask_query: $scope.externalsecuritytask.query
                }, function(response) {
                    $scope.subMittedForm = true;
                }, function(err){
                    if (err){
                        if (err.data == 'Already Submitted'){
                            utilityService.flash.warning(err.data);
                        }
                        $scope.error = err;
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };

        $scope.taskList = function(){
            $location.path(SECURITYTASKS.URL_PATH.SECURITYTASKS_LIST);
        };

    }

})();
