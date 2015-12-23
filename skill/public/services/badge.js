'use strict';

angular.module('mean.skill').factory('BadgeService', function($resource) {
	return $resource('api/badge/:badgeId', {
		badgeId : '@_id'
	}, {
		update : {
			method : 'PUT'
		}
	});
});
