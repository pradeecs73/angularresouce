(function() {
    'use strict';
    /* jshint -W098 */
    function UserController($scope, Global, $stateParams, $location, MeanUser, $rootScope, USERS, UserService, RoleService, NgTableParams, utilityService, Upload) {
        $scope.global = Global;
        $scope.USERS = USERS;
        $scope.package = {
            name: 'user'
        };
        $scope.userLogged = MeanUser.user;
        $scope.createUser = function(isValid) {
            if (isValid) {
                var user = new UserService.users($scope.newUser);
                user.$save(function(response) {
                    $scope.user = {};
                    utilityService.flash.success("User Created Successfully");
                    $location.path(USERS.URL_PATH.USER_LIST);
                }, function(error) {
                    $scope.err = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.USER_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.getRolesonUSer = function() {
            RoleService.roles.query(function(response) {
                $scope.selectedRoles = response.roles;
            }, function(error) {
                $location.path(USERS.URL_PATH.USER_LIST);
            });
        };
        $scope.getUsers = function() {
            UserService.users.query(function(response) {
                $scope.userData = response;
                $scope.tableParams = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.userData
                });
            }, function(error) {
                // TODO: Needed?
                // console.log(error);
            });
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
                    $scope.tableParams.settings().dataset = $scope.userData.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.firstname + item.lastname + item.email + item.role.name;
                        // Build a regex to perform non-case-sensitive search
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.tableParams.reload();
                }
            }
        });
        $scope.findUser = function() {
            UserService.users.get({
                createuserId: $stateParams.userId
            }, function(user) {
                $scope.user = user;
            }, function(error) {
                console.log(error);
                if (angular.isDefined(error.data[0].permission)) {
                    $location.path(USERS.URL_PATH.USER_LIST);
                    utilityService.flash.error("Access Denied");
                }
            });
        };
        $scope.newUsers = function() {
            $location.path(USERS.URL_PATH.USER_CREATE);
        };
        $scope.edit = function(userId) {
            $location.path(USERS.URL_PATH.USER_EDIT.replace(':userId', userId));
        };
        $scope.updateUser = function(Url, isValid) {
            if (isValid) {
                var user = new UserService.users($scope.user);
                user.$update({
                    createuserId: $stateParams.userId
                }, function(response) {
                    $location.path(Url);
                    utilityService.flash.success("User Updated Successfully");
                }, function(error) {
                    $scope.error = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.USER_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.delete = function(userObj) {
            if (userObj) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "User Deleted Successfully";
                        var user = new UserService.users(userObj);
                        user.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (userObj == $scope.tableParams.settings().dataset[i]) {
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
            $location.path(USERS.URL_PATH.USER_LIST);
        };
        $scope.onUsersFileSelect = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
                    alert('Only xls and xlsx are accepted.');
                    return;
                }
                $rootScope.$emit('processingContinue');
                $scope.upload = Upload.upload({
                    url: "/api/users/bulkupload",
                    method: 'POST',
                    data: {
                        file: file
                    }
                }).progress(function(event) {}).success(function(data, status, headers, config) {
                    console.log(data);
                }).error(function(err) {});
            }
        };
    }
    angular.module('mean.users').controller('UserController', UserController);
    UserController.$inject = ['$scope', 'Global', '$stateParams', '$location', 'MeanUser', '$rootScope', 'USERS', 'UserService', 'RoleService', 'NgTableParams', 'utilityService', 'Upload'];
})();