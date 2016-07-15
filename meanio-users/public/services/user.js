(function() {
    'use strict';
    angular.module('mean.users').factory('UserService', UserService);
    UserService.$inject = ['$http', '$q', '$resource'];

    function UserService($http, $q, $resource) {
        return {
            users: $resource('/api/users/:createuserId', {
                createuserId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        }
    }
})();