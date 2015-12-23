'use strict';

angular.module('mean.skill').config(
		[ '$stateProvider', function($stateProvider) {
			$stateProvider.state('badge create', {
				url : '/badge/create',
				templateUrl : '/skill/views/badge_create.html'
			}).state('badge list', {
				url : '/badges',
				templateUrl : '/skill/views/badge_list.html'
			}).state('badge edit', {
				url : '/badge/:badgeId/edit',
				templateUrl : '/skill/views/badge_edit.html'
			});
		} ]);