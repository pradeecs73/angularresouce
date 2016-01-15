'use strict';

angular.module('mean.role').config(['$stateProvider','ROLE',
 
 
	 function($stateProvider,ROLE) {
			 $stateProvider
			 .state(ROLE.STATE.LISTFEATURE, {
				 url : ROLE.URL_PATH.LISTFEATURE,
				 templateUrl : ROLE.FILE_PATH.LISTFEATURE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.CREATEFEATURE, {
				 url : ROLE.URL_PATH.CREATEFEATURE,
				 templateUrl : ROLE.FILE_PATH.CREATEFEATURE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.EDITFEATURE, {
				 url : ROLE.URL_PATH.EDITFEATURE,
				 templateUrl : ROLE.FILE_PATH.EDITFEATURE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			  .state(ROLE.STATE.SHOWFEATURE, {
				 url : ROLE.URL_PATH.SHOWFEATURE,
				 templateUrl : ROLE.FILE_PATH.SHOWFEATURE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 
		}

 ]);