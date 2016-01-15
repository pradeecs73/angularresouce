'use strict';

angular.module('mean.role').config(['$stateProvider','ROLE',
 
 
	 function($stateProvider,ROLE) {
			 $stateProvider
			 .state(ROLE.STATE.LISTROLE, {
				 url : ROLE.URL_PATH.LISTROLE,
				 templateUrl : ROLE.FILE_PATH.LISTROLE,
                 controller : 'RoleController',
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.CREATEROLE, {
				 url : ROLE.URL_PATH.CREATEROLE,
				 templateUrl : ROLE.FILE_PATH.CREATEROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.EDITROLE, {
				 url : ROLE.URL_PATH.EDITROLE,
				 templateUrl : ROLE.FILE_PATH.EDITROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			  .state(ROLE.STATE.SHOWROLE, {
				 url : ROLE.URL_PATH.SHOWROLE,
				 templateUrl : ROLE.FILE_PATH.SHOWROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			  .state(ROLE.STATE.ROLEPERMISSION, {
				 url : ROLE.URL_PATH.ROLEPERMISSION,
				 templateUrl : ROLE.FILE_PATH.ROLEPERMISSION,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
		}

 ]);