/*'use strict';

angular.module('mean.role').config([ '$stateProvider', 
    function($stateProvider) {
		$stateProvider.state('featurerole example page', {
				url : '/featurerole',
				templateUrl : 'featurerole/views/index.html',
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state('Create featurerole', {
				url : '/admin/featurerole/create',
				templateUrl : 'featurerole/views/featurerole_create.html',
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state('Edit featurerole', {
				url : '/admin/featurerole/:roleId/edit',
				templateUrl : 'featurerole/views/featurerole_edit.html',
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state('View featurerole', {
				url : '/admin/featurerole/:featureroleId/view',
				templateUrl : 'featurerole/views/featurerole_view.html',
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			.state('List featurerole', {
				url : '/admin/featurerole/list',
				templateUrl : 'role/views/featurerole_list.html',
				resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
			})
			/*.state('Role Permission Allocation', {
				url : '/admin/role/role-permission-allocation',
				templateUrl : 'role/views/role_permission_allocation.html'
			})*/
/*	} ]);*/


/*angular.module('mean.role').config(['$stateProvider','ROLE',
 
 
	 function($stateProvider,ROLE) {
			 $stateProvider
			 .state(ROLE.STATE.LISTFEATUREROLE, {
				 url : ROLE.URL_PATH.LISTFEATUREROLE,
				 templateUrl : ROLE.FILE_PATH.LISTFEATUREROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.CREATEFEATUREROLE, {
				 url : ROLE.URL_PATH.CREATEFEATUREROLE,
				 templateUrl : ROLE.FILE_PATH.CREATEFEATUREROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 .state(ROLE.STATE.EDITFEATUREROLE, {
				 url : ROLE.URL_PATH.EDITFEATUREROLE,
				 templateUrl : ROLE.FILE_PATH.EDITFEATUREROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			  .state(ROLE.STATE.SHOWFEATUREROLE, {
				 url : ROLE.URL_PATH.SHOWFEATUREROLE,
				 templateUrl : ROLE.FILE_PATH.SHOWFEATUREROLE,
				 resolve: {
	                    loggedin: function (MeanUser) {
	                        return MeanUser.checkLoggedin();
	                    }
	                }
			 })
			 
		}

 ]);*/