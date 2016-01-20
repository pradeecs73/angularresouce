'use strict';
angular.module('mean.jobs').config(
    ['$stateProvider', 'SKILLSET', function($stateProvider, SKILLSET) {
        $stateProvider.state(SKILLSET.STATE.SKILLSETCREATE, {
            url: SKILLSET.URL_PATH.SKILLSETCREATE,
            templateUrl: SKILLSET.FILE_PATH.SKILLSETCREATE,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILLSET.STATE.SKILLSETLIST, {
            url: SKILLSET.URL_PATH.SKILLSETLIST,
            templateUrl: SKILLSET.FILE_PATH.SKILLSETLIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
    }]);