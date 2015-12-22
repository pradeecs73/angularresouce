'use strict';

angular.module('mean.branch').factory('CountryService', function ($resource) {
    return {
        country: $resource('/api/country/:countryId', {countryId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray:true}
        }),
        location: $resource('/api/location', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray:true}
        })
    }
})
.factory('ZoneService', function ($resource) {
    return {
    	countryZone: $resource('/api/country/:countryId/zone', {countryId: '@countryId'}, {
            
        }),
        zone: $resource('/api/zone/:zoneId', {zoneId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray:false}
        })
    }
}).factory('CityService', function ($resource) {
    return {
    	zoneCity: $resource('/api/zone/:zoneId/city', {zoneId: '@zoneId'}, {
            
        }),
        city: $resource('/api/city/:cityId', {cityId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray:false}
        })
    }
})
.factory('BranchService', function ($resource) {
    return {
        /**branch: $resource('/api/branch/:branchId/Course/:courseId', {branchId: '@_id', courseId: '@courseId'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray:false}
        }),*/
        cityBranch: $resource('/api/city/:cityId/branch', {cityId: '@cityId'}, {
            
        }),
        branch: $resource('/api/branch/:branchId', {branchId: '@_id'}, {

            update: {method: 'PUT'},
            query: {method: 'GET', isArray:false}
        })
    }
});
/*.factory('FilterService', function ($resource) {
    return {
    	users: $resource('/api/user/:userId', {userId: '@_id'}, {
            update: {
                method: 'PUT'
            }
        }),
        filterRole :$resource('/api/filter/:roleId',{roleId :'@_id'),{
          update: {method: 'PUT'},
            query: {method: 'GET',isArray:false}
        }
       });.*/