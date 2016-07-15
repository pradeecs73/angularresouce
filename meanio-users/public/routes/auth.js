'use strict';
//Setting up route
angular.module('mean.users').config(['$httpProvider', 'jwtInterceptorProvider', '$meanStateProvider', 'USERS',
    function($httpProvider, jwtInterceptorProvider, $meanStateProvider, USERS) {
        jwtInterceptorProvider.tokenGetter = function() {
            return localStorage.getItem('JWT');
        };
        $httpProvider.interceptors.push('jwtInterceptor');
        $meanStateProvider.state(USERS.STATE.USER_CREATE, {
            url: USERS.URL_PATH.USER_CREATE,
            templateUrl: USERS.FILE_PATH.USER_CREATE
        }).state(USERS.STATE.USER_LIST, {
            url: USERS.URL_PATH.USER_LIST,
            templateUrl: USERS.FILE_PATH.USER_LIST
        }).state(USERS.STATE.USER_EDIT, {
            url: USERS.URL_PATH.USER_EDIT,
            templateUrl: USERS.FILE_PATH.USER_EDIT
        }).state(USERS.STATE.ROLE_CREATE, {
            url: USERS.URL_PATH.ROLE_CREATE,
            templateUrl: USERS.FILE_PATH.ROLE_CREATE
        }).state(USERS.STATE.ROLE_LIST, {
            url: USERS.URL_PATH.ROLE_LIST,
            templateUrl: USERS.FILE_PATH.ROLE_LIST
        }).state(USERS.STATE.ROLE_EDIT, {
            url: USERS.URL_PATH.ROLE_EDIT,
            templateUrl: USERS.FILE_PATH.ROLE_EDIT
        }).state(USERS.STATE.USER_BULUPLOAD, {
            url: USERS.URL_PATH.USER_BULUPLOAD,
            templateUrl: USERS.FILE_PATH.USER_BULUPLOAD
        });
    }
]);