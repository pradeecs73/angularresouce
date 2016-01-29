'use strict';

angular.module('mean.course').factory(
		'CourseprojectService',
		function($resource) {
			return {

				courseproject : $resource(
						'/api/courseproject/:courseprojectId', {
							courseprojectId : '@_id'
						}, {
							update : {
								method : 'PUT'
							}
						}),
				page : $resource('/api/courseproject/pagination', {}, {
					update : {
						method : 'PUT'
					},
					query : {
						method : 'GET',
						isArray : false
					}
				}),
			};
		});