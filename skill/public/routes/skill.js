'use strict';

angular.module('mean.skill').config(
		[ '$stateProvider', function($stateProvider) {
			$stateProvider.state('skill list', {
				url : '/skill/list',
				templateUrl : 'skill/views/skill_list.html'
			}).state('skill create', {
				url : '/skill/create',
				templateUrl : 'skill/views/skill_create.html'
			}).state('skill edit', {
				url : '/skill/:skillId/edit',
				templateUrl : 'skill/views/skill_edit.html'
			});
		} ]);
