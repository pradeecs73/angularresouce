'use strict';
/* jshint -W098 */
angular.module('mean.skill',['ngTagsInput']).controller('SkillController',function($scope, Global, SkillService, $stateParams, $location, $rootScope, PROFILE) {
    $scope.global = Global;
    $scope.PROFILE = PROFILE;
    $scope.SERVICE = SkillService;
	initializePagination($scope, $rootScope, $scope.SERVICE);
	
    $scope.package = {
        name: 'skill'
    };
    
    $scope.find = function() {
        SkillService.skill.query(function(skills) {
            $scope.collection = skills;
        });
        $scope.currentPage = 1;
        $scope.currentPageSize = 10; 
        $scope.loadPagination($scope.currentPage, $scope.currentPageSize);
    }; 
    
    $scope.create = function(isValid) {

        if (isValid) {
            $scope.skill.keywords= _.pluck($scope.skill.keywords, 'text');
            var skill = new SkillService.skill($scope.skill);
            skill.$save(function(response) {
                $location.path('/skill/list');
                $scope.skill = {};
            }, function(error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.remove = function(Skill) {
        if (Skill) {
        	var skill = new SkillService.skill($scope.skill);
            skill.$remove(function(response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === Skill) {
                        $scope.collection.splice(i, 1);
                    }
                }
                $('#deleteSkill').hide();
                $location.path('/skill/list');
            });
        }
    };
    $scope.update = function(isValid) {
        if (isValid) {
            $scope.skill.keywords= _.pluck($scope.skill.keywords, 'text');
            var skill = $scope.skill;
            if (!skill.updated) {
                skill.updated = [];
            }
            skill.updated.push(new Date().getTime());
            skill.$update(function() {
                $location.path('/skill/list');
            }, function(error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function() {
         console.log("1");
        SkillService.skill.get({
            skillId: $stateParams.skillId
        }, function(skill) {
            $scope.skill = skill;
            $scope.skill.keywords=_.map(skill.keywords, function(skilltext){ return {"text":skilltext} });
        });
    };
    $scope.cancelSkill = function() {
        $location.path('/skill/list');
    };
    $scope.newSkill = function() {
        $location.path('/skill/create');
    };
    $scope.modalDeleteSkill = function(skill) {
        $scope.skill = skill;
        $('#deleteSkill').modal("show");
    };
    $scope.cancelDelete = function() {
        $('#deleteSkill').modal("hide");
    };
    $scope.redirectdashboard = function(){
        $location.path(PROFILE.URL_PATH.DASHBOARD);
  };
});