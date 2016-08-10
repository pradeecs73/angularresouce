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
        }).state(USERS.STATE.USER_BULKUPLOAD, {
            url: USERS.URL_PATH.USER_BULKUPLOAD,
            templateUrl: USERS.FILE_PATH.USER_BULKUPLOAD
        }).state(USERS.STATE.USER_BULKFILE, {
            url: USERS.URL_PATH.USER_BULKFILE,
            templateUrl: USERS.FILE_PATH.USER_BULKFILE
        }).state(USERS.STATE.USER_PROFILE, {
            url: USERS.URL_PATH.USER_PROFILE,
            templateUrl: USERS.FILE_PATH.USER_PROFILE
        }).state(USERS.STATE.USER_PROFILE_MANAGE, {
            url: USERS.URL_PATH.USER_PROFILE_MANAGE,
            templateUrl: USERS.FILE_PATH.USER_PROFILE_MANAGE
        }).state(USERS.STATE.USER_PROFILE_HELP, {
            url: USERS.URL_PATH.USER_PROFILE_HELP,
            templateUrl: USERS.FILE_PATH.USER_PROFILE_HELP
        });
    }
]);