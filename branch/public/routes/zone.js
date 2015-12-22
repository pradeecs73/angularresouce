'use strict';

angular.module('mean.branch').config([ '$stateProvider', 'BRANCH',
        function($stateProvider, BRANCH) {
    $stateProvider.state(BRANCH.STATE.LISTZONE, {
     url : BRANCH.URL_PATH.LISTZONE,
     templateUrl : BRANCH.FILE_PATH.LISTZONE,
     resolve: {
                      loggedin: function (MeanUser) {
                          return MeanUser.checkLoggedin();
                      }
                  }
    })
    .state(BRANCH.STATE.CREATEZONE, {
     url : BRANCH.URL_PATH.CREATEZONE,
     templateUrl : BRANCH.FILE_PATH.CREATEZONE,
     resolve: {
                      loggedin: function (MeanUser) {
                          return MeanUser.checkLoggedin();
                      }
                  }
    })
    .state(BRANCH.STATE.EDITZONE, {
     url : BRANCH.URL_PATH.EDITZONE,
     templateUrl : BRANCH.FILE_PATH.EDITZONE,
     resolve: {
                      loggedin: function (MeanUser) {
                          return MeanUser.checkLoggedin();
                      }
                  }
    })
  }
]);