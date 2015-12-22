'use strict';


angular.module('mean.branch').config(['$stateProvider','BRANCH',
		 function($stateProvider,BRANCH) {
			$stateProvider
			.state(BRANCH.STATE.LISTCOUNTRY, {
				url : BRANCH.URL_PATH.LISTCOUNTRY,
				templateUrl : BRANCH.FILE_PATH.LISTCOUNTRY,
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state(BRANCH.STATE.CREATECOUNTRY, {
				url : BRANCH.URL_PATH.CREATECOUNTRY,
				templateUrl : BRANCH.FILE_PATH.CREATECOUNTRY,
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state(BRANCH.STATE.EDITCOUNTRY, {
				url : BRANCH.URL_PATH.EDITCOUNTRY,
				templateUrl : BRANCH.FILE_PATH.EDITCOUNTRY,
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state(BRANCH.STATE.SHOWCOUNTRY, {
				url : BRANCH.URL_PATH.SHOWCOUNTRY,
				templateUrl : BRANCH.FILE_PATH.SHOWCOUNTRY,
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
		}
]);
