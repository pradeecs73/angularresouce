/*'use strict';

angular.module('mean.jobs').config(
		[ '$stateProvider','JOBS', function($stateProvider,JOBS) {
			$stateProvider.state(JOBS.STATE.JOBSLIST, {
				 url : JOBS.URL_PATH.JOBSLIST,
				 templateUrl : JOBS.FILE_PATH.JOBSLIST,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 }).state(JOBS.STATE.JOBDETAIL, {
				 url : JOBS.URL_PATH.JOBDETAIL,
				 templateUrl : JOBS.FILE_PATH.JOBDETAIL,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 }).state(JOBS.STATE.SITELIST, {
				 url : JOBS.URL_PATH.SITELIST,
				 templateUrl : JOBS.FILE_PATH.SITELIST,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 }).state(JOBS.STATE.SITECREATE, {
				 url : JOBS.URL_PATH.SITECREATE,
				 templateUrl : JOBS.FILE_PATH.SITECREATE,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 }).state(JOBS.STATE.SITEEDIT, {
				 url : JOBS.URL_PATH.SITEEDIT,
				 templateUrl : JOBS.FILE_PATH.SITEEDIT,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 }).state(JOBS.STATE.SITEDETAILS, {
				 url : JOBS.URL_PATH.SITEDETAILS,
				 templateUrl : JOBS.FILE_PATH.SITEDETAILS,
				 resolve: {
		                    loggedin: function (MeanUser) {
		                        return MeanUser.checkLoggedin();
		                    }
		                }
			 });
		} ]);
*/