'use strict';
angular.module('mean.jobs').factory('Jobs', ['$resource',
    function($resource) {
		 return $resource('/api/jobs/:jobId', { jobId: '@_id' }, {
		    update: {
		      method: 'PUT' // this method issues a PUT request
		    },
		    query:{
		      method:'GET',isArray:true	
		    }
		  });
    }
]);