'use strict';
/* jshint -W098 */
angular.module('mean.jobs', ["angucomplete-alt"]).controller('SkillSetController', ['$scope', 'SkillService', '$location', 'Global', 'SkillSetService', '$http', '$rootScope', 'PROFILE', '$stateParams', 'SKILLSET', 'MESSAGES', 'flash',
    function($scope, SkillService, $location, Global, SkillSetService, $http, $rootScope, PROFILE, $stateParams, SKILLSET, MESSAGES, flash) {
        $scope.global = Global;
        $scope.package = {
            name: 'Skillset',
            modelName: 'Skillset',
            featureName: 'Skill Set'
        };
        $scope.SKILLSET = SKILLSET;
        $scope.PROFILE = PROFILE;
        $scope.SERVICE = SkillSetService;
        $scope.MESSAGES = MESSAGES;
        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
        initializeBreadCrum($scope, $scope.package.modelName, SKILLSET.URL_PATH.SKILLSETLIST);
        initializePagination($scope, $rootScope, $scope.SERVICE);
        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES);
        $scope.skillsetarray = [{
            'main': false
        }];
        $scope.personCallback = function(result) {
            $scope.selectedPerson = result;
        };
        $scope.loadfilterSkills = function() {
            SkillService.skill.query(function(skillsetskilllist) {
                $scope.skillsetskilllist = skillsetskilllist;
            });
        };
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.skillset.skill = $scope.skillsetarray;
                var skillsetcreate = new SkillSetService.skillsetdetails($scope.skillset);
                skillsetcreate.$save(function(response) {
                    $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.skillselected = function(selected) {
            $scope.skillsetarray[this.$parent.$index].skillid = selected.originalObject._id;
        };
        $scope.cancelSkillSet = function() {
            $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
        };
        $scope.addskillrow = function(index) {
            $scope.skillsetarray.push({
                'main': false
            });
        };
        $scope.removeskillrow = function(index) {
            $scope.skillsetarray.splice(index, 1);
        };
        $scope.newskillSet = function() {
            $location.path(SKILLSET.URL_PATH.SKILLSETCREATE);
        };
        $scope.removepop = function(skillset) {
            $scope.deleteObj = skillset;
            $('#deletePopup').modal("show");
        };
        $scope.remove = function(skillset) {
            var deleteskillset = new SkillSetService.skillsetdetails(skillset);
            deleteskillset.$remove(function(response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === skillset) {
                        $scope.collection.splice(i, 1);
                    }
                    $('#deletePopup').modal("hide");
                    $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
                }
            }, function(error) {
                $scope.error = error;
            });
        };
    }
]);