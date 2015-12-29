'use strict';
angular.module('mean.jobs').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('jobs example page', {
            url: '/jobs/example',
            templateUrl: 'jobs/views/index.html'
        })
        .state('jobs List page', {
            url: '/jobs',
            templateUrl: 'jobs/views/jobslist.html'
        })
        .state('job detailed page', {
            url: '/job/:jobId/details',
            templateUrl: 'jobs/views/jobdetail.html'
        })
    }
]);