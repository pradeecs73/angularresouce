'use strict';

angular.module('mean.mypractise').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('mypractise example page', {
      url: '/mypractise/example',
      templateUrl: 'mypractise/views/index.html'
    });
  }
]);
