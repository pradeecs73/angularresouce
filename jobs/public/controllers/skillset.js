'use strict';
/* jshint -W098 */
angular.module('mean.jobs',['ngTagsInput']).controller('SkillSetController', ['$scope', 'SkillService', '$location', 'Global', 'SkillSet', '$http', '$rootScope', 'PROFILE', '$stateParams',
    function($scope, SkillService, $location, Global, SkillSet, $http, $rootScope, PROFILE, $stateParams) {
    	$scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.SERVICE = SkillSet;
        initializePagination($scope, $rootScope, $scope.SERVICE);
        $scope.skillsetarray=[{'main':false}];

        $scope.loadInput = function($query) {
            return $scope.skillList.filter(function(skill) {
                return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

        $scope.loadfilterSkills = function() {
            SkillService.skill.query(function(skillList) {
                $scope.skillList = skillList;
            });
        };

        $scope.create = function(isValid) {

				if (isValid) {
					console.log($scope.skillset);
					console.log($scope.skillsetarray);
				} else {
					$scope.submitted = true;
				}
			};

        $scope.cancelSkillSet = function() {
				$location.path(SKILL.URL_PATH.SKILLLIST);
			};

	    $scope.addskillrow = function(index) {
				$scope.skillsetarray.push({'main':false});
			};
			

		$scope.removeskillrow = function(index) {
			$scope.skillsetarray.splice(index,1);
		};		

    }
    ]);