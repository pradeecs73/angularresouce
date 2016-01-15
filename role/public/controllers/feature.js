'use strict';
/ JSHint -W098 /
angular.module('mean.role').controller('FeatureController',
    function ($scope, $rootScope, $stateParams, $location, Global, FeatureService, $window, ROLE, MESSAGES,flash,PROFILE) {
        $scope.global = Global;
        $scope.package = {
            name: 'Role',
            modelName: 'Feature',
            featureName: 'Features'
        };
        $scope.url = '/'
        $scope.ROLE = ROLE;
        $scope.MESSAGES = MESSAGES;
        $scope.PROFILE = PROFILE;
        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

        initializeBreadCrum($scope,$scope.package.modelName,ROLE.URL_PATH.LISTFEATURE);

        initializePagination($scope, $rootScope, FeatureService);

        initializeDeletePopup($scope,$scope.package.modelName,MESSAGES);

         $scope.componentWidth = [{
            option:"3",
            value:"25%"
        },
        {
            option:"4",
            value:"33%"
        },{
            option:"6",
            value:"50%"
        },{
            option:"12",
            value:"100%"
        }];

        $scope.hasAuthorization = function (role) {
            if (!role || !role.user) {
                return false;
            }
            return MeanUser.isAdmin || role.user._id === MeanUser.user._id;
        };

        $scope.newFeature = function () {
            $location.path(ROLE.URL_PATH.CREATEFEATURE);
        };

        $scope.loadNewFeatureForm=function(){
            if ($scope.writePermission) {
            $scope.newfeature = {};
            $scope.breadCrumAdd("Create");
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.create = function (isValid) {
            if ($scope.writePermission) {
                if (isValid) {
                    var feature = new FeatureService.feature($scope.newfeature);
                    feature.$save(function (response) {
                        flash.setMessage(MESSAGES.FEATURE_ADD_SUCCESS,MESSAGES.SUCCESS);
                        $location.path(ROLE.URL_PATH.LISTFEATURE);
                    }, function (error) {
                        $scope.error = error;
                    });
                } else {
                    $scope.submitted = true;
                }
           } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.remove = function (feature) {
             if (feature && $scope.deletePermission) {
            var feature1 = new FeatureService.feature(feature);
            feature1.$remove(function (response) {
                deleteObjectFromArray($scope.collection,feature);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.FEATURE_DELETE_SUCCESS,MESSAGES.SUCCESS);
                $location.path(ROLE.URL_PATH.LISTFEATURE);
            });
              } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.update = function (isValid) {
            if ($scope.updatePermission) {
            if (isValid) {
                var feature = new FeatureService.feature($scope.feature);
                if (!feature.updated) {
                    feature.updated = [];
                }
                feature.updated.push(new Date().getTime());
                feature.$update({
                    featureId: $stateParams.featureId
                }, function () {
                    flash.setMessage(MESSAGES.FEATURE_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(ROLE.URL_PATH.LISTFEATURE);
                });
            } else {
                alert("Some field is missing.");
                $scope.submitted = true;
            }
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

       /* $scope.show = function (feature) {
            $rootScope.feature = feature;
            $location.path('/admin/feature/' + feature._id + '/show');
        };
*/
        $scope.findOne = function () {
            if ($scope.updatePermission) {
            FeatureService.feature.get({
                featureId: $stateParams.featureId
            }, function (feature) {
                $scope.feature = feature;
                $scope.breadCrumAdd("Edit");
            });

            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.cancel = function () {
            $location.path(ROLE.URL_PATH.LISTFEATURE);
        };
        $scope.findShow = function () {
            FeatureService.feature.get({
                featureId: $stateParams.featureId
            }, function (feature) {
                $scope.feature = feature;
                $scope.breadCrumAdd("Show");
            });
        };
        $scope.enableWidth = function(){
            $scope.enablecomponent = false;
            if($scope.newfeature.isComponent){
                $scope.enablecomponent = true;
            }
            else{
                $scope.enablecomponent = false;
            }
        }

    });
