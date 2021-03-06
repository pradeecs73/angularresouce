(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.users').controller('RoleController', RoleController);
    RoleController.$inject = ['$scope', 'Global', '$stateParams', '$location', 'MeanUser', '$rootScope', 'USERS', 'UserService', 'RoleService', 'NgTableParams', 'utilityService', 'FeatureService'];

    function RoleController($scope, Global, $stateParams, $location, MeanUser, $rootScope, USERS, UserService, RoleService, NgTableParams, utilityService, FeatureService) {
        $scope.global = Global;
        $scope.USERS = USERS;
        $scope.package = {
            name: 'user'
        };
        $scope.newRole = {};
        $scope.newRole.permissions = {};
        $scope.userLogged = MeanUser.user;
        $scope.getFeatures = function() {
            FeatureService.features.query(function(response) {
                $scope.features = response;
            }, function(error) {});
        };
        $scope.addFeature = function(feature) {
            if (angular.isDefined($scope.newRole.permissions[feature._id])) {
                delete $scope.newRole.permissions[feature._id];
                $scope.disable = false;
            } else {
                $scope.newRole.permissions[feature._id] = {};
                $scope.newRole.permissions[feature._id].read = true;
                $scope.disable = true;
            }
        };
        $scope.createRole = function(isValid) {
            if (isValid) {
                var role = new RoleService.roles($scope.newRole);
                role.$save(function(response) {
                    $scope.role = {};
                    $location.path(USERS.URL_PATH.ROLE_LIST);
                    utilityService.flash.success("Role Created Successfully");
                }, function(error) {
                    $scope.err = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.ROLE_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.getRoles = function() {
            RoleService.roles.query(function(response) {
                $scope.roleData = response.roles;
                $scope.roleDataset2 = response.pristine;
                $scope.tableParams = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.roleData,
                });
                $scope.tablePristine = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.roleDataset2
                });
            }, function(error) {});
        };
        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.tableParams)) {
                    $scope.tableParams.settings().dataset = $scope.roleData.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.name + item.description;
                        // Build a regex to perform non-case-sensitive search
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.tableParams.reload();
                }
            }
        });
        $scope.findRole = function() {
            RoleService.roles.get({
                roleId: $stateParams.roleId
            }, function(role) {
                $scope.role = role;
            }, function(error) {
                if (angular.isDefined(error.data[0].permission)) {
                    $location.path(USERS.URL_PATH.ROLE_LIST);
                    utilityService.flash.error("Access Denied");
                }
            });
        };
        $scope.editFeature = function(feature) {
            if (angular.isDefined($scope.role.permissions[feature._id])) {
                delete $scope.role.permissions[feature._id];
                $scope.disable = false;
            } else {
                $scope.role.permissions[feature._id] = {};
                $scope.role.permissions[feature._id].read = true;
                $scope.disable = true;
            }
        };
        $scope.newRoles = function() {
            $location.path(USERS.URL_PATH.ROLE_CREATE);
        };
        $scope.edit = function(roleId) {
            $location.path(USERS.URL_PATH.ROLE_EDIT.replace(':roleId', roleId));
        };
        $scope.updateRole = function(Url, isValid) {
            if (isValid) {
                var updateRole = new RoleService.roles($scope.role);
                updateRole.$update({
                    roleId: $stateParams.roleId
                }, function(role) {
                    $location.path(Url);
                    utilityService.flash.success("Role updated Successfully");
                }, function(error) {
                    $scope.error = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.ROLE_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.delete = function(roleObj) {
            if (roleObj) {
                utilityService.delConfirm(function(result) {
                    var message = "";
                    if (result) {
                        message = "Role Deleted Successfully";
                        var role = new RoleService.roles(roleObj);
                        role.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (roleObj == $scope.tableParams.settings().dataset[i]) {
                                    $scope.tableParams.settings().dataset.splice(i, 1)
                                }
                            }
                            $scope.tableParams.reload().then(function(data) {
                                if (data.length === 0 && $scope.tableParams.total() > 0) {
                                    $scope.tableParams.page($scope.tableParams.page() - 1);
                                    $scope.tableParams.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        $scope.cancelRedirect = function() {
            $location.path(USERS.URL_PATH.ROLE_LIST);
        }
    }
})();