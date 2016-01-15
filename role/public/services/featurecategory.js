'use strict';

angular.module('mean.role').factory('FeaturecategoryService', function($resource) {
	return{
	featurecategory : $resource('/api/featurecategory/:featurecategoryId', {
		featurecategoryId : '@_id'
	}, {
		update : {
			method : 'PUT'
		}
	}),
	page : $resource('/api/featurecategory/pagination', {}, {
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
