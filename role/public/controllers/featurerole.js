'use strict';
/* jshint -W098 */

angular.module('mean.role').controller('FeatureroleController', ['$scope', 'Global', 'FeatureroleService', 'FeatureService', 'PROFILE', 'ROLE',
    function ($scope, Global, FeatureroleService, FeatureService, PROFILE, ROLE) {
        $scope.global = Global;
        $scope.package = {
            name: 'featurerole'
        };
        $scope.PROFILE = PROFILE;
        $scope.ROLE = ROLE;
        $scope.hasAuthorization = function (role) {

            if (!role || !role.user) {
                return false;
            }
            return MeanUser.isAdmin || role.user._id === MeanUser.user._id;
        };

        $scope.list = function () {
            $scope.role = {};
            FeatureroleService.query(function (featureroles) {
                $scope.featureroles = featureroles;
            });
        };
        $scope.create = function (isValid) {
            if (isValid) {
                var featurerole = new FeatureroleService($scope.featurerole);
                featurerole.$save(function (response) {
                    $location.path(ROLE.URL_PATH.LISTFEATUREROLE);
                    $scope.featurerole = {};
                    //$rootScope.feature = [];
                }, function (error) {
                    $scope.error = error;
                });
            } else {

                $scope.submitted = true;
            }

        };

        $scope.remove = function (Featurerole) {
            if (Featurerole) {
                Featurerole.$remove(function (response) {
                    for (var i in $scope.featureroles) {
                        if ($scope.featureroles[i] === Featurerole) {
                            $scope.featureroles.splice(i, 1);
                        }
                    }
                    $location.path(ROLE.URL_PATH.LISTFEATUREROLE);
                    //$('#deleteRole').hide();
                });
            } else {
                $scope.featurerole.$remove(function (response) {
                    $location.path(ROLE.URL_PATH.LISTFEATUREROLE);
                    //$('#deleteRole').hide();
                });
            }
        };
        //Update Role with features
        /* $scope.updatefeatures = function(feature, role) {
         var found = false;
         var foundIndex = -1;
         for (var i = 0; i < $scope.role.feature.length; i++) {
         if ($scope.role.feature[i]._id === feature._id) {
         found = true;
         foundIndex = i;
         }
         }
         if (found) {
         $scope.role.feature.splice(foundIndex, 1);
         } else {
         $scope.role.feature.push(feature);
         }
         };*/
        //Update Role
        $scope.update = function (isValid) {
            if (isValid) {
                var featurerole = new FeatureroleService($scope.featurerole);
                if (!featurerole.updated) {
                    featurerole.updated = [];
                }
                featurerole.updated.push(new Date().getTime());
                featurerole.$update({
                    featureroleId: $stateParams.featureroleId
                }, function () {
                    $location.path(ROLE.URL_PATH.LISTFEATUREROLE);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                alert("Some field is missing.");
                $scope.submitted = true;
            }
        };
        $scope.show = function (featurerole) {
            $rootScope.featurerole = featurerole;
            $location.path('/admin/featurerole/' + featurerole._id + '/show');
        }
        /*$scope.zoneList = function(role) {
         //$rootScope.role = role;
         //$location.path('/admin/role/'+role._id+'/zone/list');
         $location.path('/admin/role/zone/list');
         }*/
        $scope.findOne = function () {
            $scope.featureList();
            FeatureroleService.get({
                featureroleId: $stateParams.featureroleId
            }, function (featurerole) {
                $scope.featurerole = featurerole;
            });
        };
        $scope.cancel = function () {
            $location.path(ROLE.URL_PATH.LISTFEATUREROLE);
        };
        $scope.modalDeleteRole = function (featurerole) {
            $scope.featurerole = featurerole;
            $('#deleteRole').show();
        };
        $scope.cancelRole = function () {
            $('#deleteRole').hide();
        }
        $scope.featureList = function () {
            $scope.feature = {};
            FeatureService.query(function (features) {
                $scope.features = features;
            });
        };

        $scope.redirectdashboard = function () {
            $location.path(PROFILE.URL_PATH.DASHBOARD);
        }

    }
]);