'use strict';

//Setting up route
angular.module('mean.users').config(function ($meanStateProvider, $httpProvider, jwtInterceptorProvider, USERS) {

    jwtInterceptorProvider.tokenGetter = function () {
        return localStorage.getItem('JWT');
    };

    $httpProvider.interceptors.push('jwtInterceptor');

    // states for my app
    $meanStateProvider
        .state(USERS.STATE.AUTH, {
            url: USERS.URL_PATH.AUTH,
            templateUrl: USERS.FILE_PATH.AUTH
        })
        .state(USERS.STATE.LOGIN, {
            url: USERS.URL_PATH.LOGIN,
            templateUrl: USERS.FILE_PATH.LOGIN,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state(USERS.STATE.REGISTER, {
            url: USERS.URL_PATH.REGISTER,
            templateUrl: USERS.FILE_PATH.REGISTER,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state(USERS.STATE.FORGOT_PASSWORD, {
            url: USERS.URL_PATH.FORGOT_PASSWORD,
            templateUrl: USERS.FILE_PATH.FORGOT_PASSWORD,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state(USERS.STATE.RESET_PASSWORD, {
            url: USERS.URL_PATH.RESET_PASSWORD,
            templateUrl: USERS.FILE_PATH.RESET_PASSWORD,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state(USERS.STATE.USER, {
            url: USERS.URL_PATH.USER,
            templateUrl: USERS.FILE_PATH.USER
        })
        .state(USERS.STATE.EDIT_USER, {
            url: USERS.URL_PATH.EDIT_USER,
            templateUrl: USERS.FILE_PATH.EDIT_USER,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.USER_LIST, {
            url: USERS.URL_PATH.USER_LIST,
            templateUrl: USERS.FILE_PATH.USER_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.USER_CREATE, {
            url: USERS.URL_PATH.USER_CREATE,
            templateUrl: USERS.FILE_PATH.USER_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.USER_EDIT, {
            url: USERS.URL_PATH.USER_EDIT,
            templateUrl: USERS.FILE_PATH.USER_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.USER_VIEW, {
            url: USERS.URL_PATH.USER_VIEW,
            templateUrl: USERS.FILE_PATH.USER_VIEW,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }

        })
        .state(USERS.STATE.SUCCESS, {
            url: USERS.URL_PATH.SUCCESS,
            templateUrl: USERS.FILE_PATH.SUCCESS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.CONFIRM, {
            url: USERS.URL_PATH.CONFIRM,
            templateUrl: USERS.FILE_PATH.CONFIRM,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state(USERS.STATE.CHANGEPASSWORD, {
            url: USERS.URL_PATH.CHANGEPASSWORD,
            templateUrl: USERS.FILE_PATH.CHANGEPASSWORD,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.TEST, {
            url: USERS.URL_PATH.TEST,
            templateUrl: USERS.FILE_PATH.TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(USERS.STATE.MENTORREG, {
            url: USERS.URL_PATH.MENTORREG,
            templateUrl: USERS.FILE_PATH.MENTORREG,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })

});