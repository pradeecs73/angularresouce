(function() {
    'use strict';
    angular.module('mean.building').config(Building);
    Building.$inject = ['$stateProvider', 'BUILDING'];

    function Building($stateProvider, BUILDING) {
        $stateProvider.state(BUILDING.STATE.BUILDING_ADD, {
            url: BUILDING.PATH.BUILDING_ADD,
            templateUrl: BUILDING.FILE_PATH.BUILDING_ADD,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(BUILDING.STATE.BUILDING_LIST, {
            url: BUILDING.PATH.BUILDING_LIST,
            templateUrl: BUILDING.FILE_PATH.BUILDING_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(BUILDING.STATE.BUILDING_EDIT, {
            url: BUILDING.PATH.BUILDING_EDIT,
            templateUrl: BUILDING.FILE_PATH.BUILDING_EDIT,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });

    }
})();