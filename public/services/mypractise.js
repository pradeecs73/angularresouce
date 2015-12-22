'use strict';

angular.module('mean.mypractise').factory('Mypractise', ['$resource',
  function($resource) {
    return $resource('/api/products/:productid', { productid: '@_id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    },
    query:{
      method:'GET',isArray:true	
    }
  });
  }
]);
