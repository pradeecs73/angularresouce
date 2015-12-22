'use strict';
angular.module('mean.branch').config(['$stateProvider','BRANCH',
 function($stateProvider,BRANCH) {
		 $stateProvider
		 .state(BRANCH.STATE.LISTCITY, {
		 url : BRANCH.URL_PATH.LISTCITY,
		 templateUrl : BRANCH.FILE_PATH.LISTCITY,
		 resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
		 })
		 .state(BRANCH.STATE.CREATECITY, {
		 url : BRANCH.URL_PATH.CREATECITY,
		 templateUrl : BRANCH.FILE_PATH.CREATECITY,
		 resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
		 })
		 .state(BRANCH.STATE.EDITCITY, {
		 url : BRANCH.URL_PATH.EDITCITY,
		 templateUrl : BRANCH.FILE_PATH.EDITCITY,
		 resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
		 })
	}

 ]);