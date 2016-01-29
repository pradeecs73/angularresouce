'use strict';

angular.module('mean.course').factory('CoursesService', function($resource) {
	return {
		page : $resource('api/course/:courseId', { courseId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
	}
});

angular.module('mean.course').factory('CourseBranchService', function($resource) {
	return {
		paymentScheme : $resource('/api/course/:courseId/payment-scheme/branch/:branchId', {  branchId : '@branchId', courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		paymentSchemeMultipleBranch: $resource('/api/course/:courseId/payment-scheme/city/:cityId', {  cityId : '@cityId', courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
	}
});