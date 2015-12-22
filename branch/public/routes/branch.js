'use strict';

angular.module('mean.branch').config(['$stateProvider','BRANCH',
 function($stateProvider,BRANCH) {
		 $stateProvider
		 .state(BRANCH.STATE.LISTBRANCH, {
			 url : BRANCH.URL_PATH.LISTBRANCH,
			 templateUrl : BRANCH.FILE_PATH.LISTBRANCH,
			 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
		 })
		 .state(BRANCH.STATE.CREATEBRANCH, {
			 url : BRANCH.URL_PATH.CREATEBRANCH,
			 templateUrl : BRANCH.FILE_PATH.CREATEBRANCH,
			 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
		 })
		 .state(BRANCH.STATE.EDITBRANCH, {
			 url : BRANCH.URL_PATH.EDITBRANCH,
			 templateUrl : BRANCH.FILE_PATH.EDITBRANCH,
			 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
		 })
	}

 ]);