'use strict';

angular.module('mean.role').config(
		[ '$stateProvider','ROLE', function($stateProvider,ROLE) {
			$stateProvider.state(ROLE.STATE.FEATURECATEGORYLIST, {
	            url: ROLE.URL_PATH.FEATURECATEGORYLIST,
	            templateUrl: ROLE.FILE_PATH.FEATURECATEGORYLIST,
	            resolve: {
	                loggedin: function (MeanUser) {
	                    return MeanUser.checkLoggedin();
	                }
	            }
	        }).state(ROLE.STATE.FEATURECATEGORYCREATE, {
	            url: ROLE.URL_PATH.FEATURECATEGORYCREATE,
	            templateUrl: ROLE.FILE_PATH.FEATURECATEGORYCREATE,
	            resolve: {
	                loggedin: function (MeanUser) {
	                    return MeanUser.checkLoggedin();
	                }
	            }
	        }).state(ROLE.STATE.FEATURECATEGORYEDIT, {
	            url: ROLE.URL_PATH.FEATURECATEGORYEDIT,
	            templateUrl: ROLE.FILE_PATH.FEATURECATEGORYEDIT,
	            resolve: {
	                loggedin: function (MeanUser) {
	                    return MeanUser.checkLoggedin();
	                }
	            }
	        }).state(ROLE.STATE.FEATURECATEGORYDETAILS, {
	            url: ROLE.URL_PATH.FEATURECATEGORYDETAILS,
	            templateUrl: ROLE.FILE_PATH.FEATURECATEGORYDETAILS,
	            resolve: {
	                loggedin: function (MeanUser) {
	                    return MeanUser.checkLoggedin();
	                }
	            }
	        })
		} ]);
