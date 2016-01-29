'use strict';
angular.module('mean.course').factory('BATCHService', function($resource) {
    return {
        batch: $resource('/api/batch/:batchId', {
            batchId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        page: $resource('/api/batchlist/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }),
        branchCourses: $resource('/api/branchCourses', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        })
    };



})