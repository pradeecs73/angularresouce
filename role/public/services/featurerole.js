'use strict';

angular.module('mean.role').factory('FeatureroleService', function ($resource) {
    return {
        role: $resource('/api/featurerole/role/:roleId', {
            roleId: '@_id'}, {
            update: {method: 'PUT'}
        }),
        page: $resource('/api/featurerole/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    };
});
