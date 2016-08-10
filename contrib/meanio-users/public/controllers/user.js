(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.users').controller('UserController', UserController);

    UserController.$inject = ['$scope', 'Global', '$stateParams', '$location', 'MeanUser', '$rootScope', 'USERS', 'UserService', 'RoleService', 'NgTableParams', 'utilityService', 'Upload', '$http', '$window', 'BUILDING'];

    function UserController($scope, Global, $stateParams, $location, MeanUser, $rootScope, USERS, UserService, RoleService, NgTableParams, utilityService, Upload, $http, $window, BUILDING) {
        $scope.global = Global;
        $scope.USERS = USERS;
        $scope.package = {
            name: 'user'
        };
        $scope.uploadBegins = false;
        $scope.userLogged = MeanUser.user;
        $scope.createUser = function(isValid) {
            if (isValid) {
                var user = new UserService.users($scope.newUser);
                var buildingsArray = $("#tree").jstree("get_checked", true);
                user.locationAndBuilding = buildingsArray;
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
                    $scope.tableParams.settings().dataset = $scope.userData.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.firstname + item.lastname + item.email + item.role.name;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
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
                if (angular.isDefined(error.data[0].permission)) {
                    $location.path(USERS.URL_PATH.USER_LIST);
                    utilityService.flash.error("Access Denied");
                }
            });
        };
        $scope.getProfile = function() {
            UserService.currentUser.get({}, function(user) {
                if (!user) {
                    $window.location.href = '/';
                    utilityService.flash.error('Error fetching user.');
                } else {
                    $scope.profile = user;
                }
            });
        };
        $scope.saveProfile = function(isValid) {
            if (isValid) {
                var profile = new UserService.currentUser($scope.profile);
                profile.$save(function(response) {
                    $location.path(USERS.URL_PATH.USER_PROFILE_MANAGE);
                    utilityService.flash.success("Profile Update Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };
        $scope.passMatch = false;
        $scope.updatePassword = function(isValid) {
            var Err = true;
            if ($scope.changePassword.password !== $scope.changePassword.confirmPassword) {
                $scope.passMatch = true;
                Err = false;
            }
            if (isValid && Err) {
                var changePassword = new UserService.updateUserPassword($scope.changePassword);
                changePassword.$save(function(response) {
                    $location.path(USERS.URL_PATH.USER_PROFILE_MANAGE);
                    utilityService.flash.success("Password changed Successfully");
                    $scope.changePassword = {};
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("Please fill all details");
                $scope.submitted3 = true;
            }
        }

        $scope.changeErr = function() {
            $scope.passMatch = false;
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
                var buildingsArray = $("#tree").jstree("get_checked", true);
                user.locationAndBuilding = buildingsArray;
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
                    var message = "";
                    if (result) {
                        message = "User Deleted Successfully";
                        var user = new UserService.users(userObj);
                        user.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (userObj == $scope.tableParams.settings().dataset[i]) {
                                    $scope.tableParams.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.userData.length; i++) {
                                if (userObj == $scope.userData[i]) {
                                    $scope.userData.splice(i, 1);
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
        $scope.getRoleSelect = function() {
            RoleService.roleSelect.query(function(roles) {
                $scope.roleArray = roles;
            });
        };
        $scope.onUsersFileSelect = function(file) {
            $scope.resultUsersSet = [];
            if (file) {
                if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
                    $scope.uploadBegins = false;
                    utilityService.flash.error('Only xls and xlsx are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/users/bulkupload",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.uploadBegins = true;
                        $scope.resultUsersSet = data.result
                    }).error(function(err) {
                        $scope.uploadBegins = false;
                        utilityService.flash.error(err.error);
                    });
                }
            }
        };
        $scope.cancelRedirectList = function() {
            $location.path(USERS.URL_PATH.USER_LIST);
        };
        $scope.bulkUploadRedirect = function() {
            $scope.uploadBegins = false;
            $location.path(USERS.URL_PATH.USER_BULKFILE);
        };
        $scope.getTemplate = function() {
            $http({
                url: '/api/users/getTemplate',
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response) {
                var blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                saveAs(blob, 'bulkupload_user_template' + '.xlsx');
            });
        };
        /**
         * Initialize jsTree
         * @params {data} contain json of location and building to initialize jstree
         */
        $scope.initializeTree = function(data) {
            $('#tree').jstree({
                'core': {
                    'data': data
                },
                'plugins': ["wholerow", "checkbox", "types", "themes"],
                'check_callback': true,
                'types': {
                    'default': {
                        'icon': 'glyphicon glyphicon-flash'
                    },
                    'location': {
                        'icon': 'fa fa-map-marker'
                    },
                    'building': {
                        'icon': 'fa fa-building'
                    }
                }
            })
            $('#tree').bind("ready.jstree", function(e, data) {
                $('#tree').jstree("open_all");
            });
        };

        /**
         * fetch building and location & convert to json format required bu jsTree
         */
        $scope.initLocBuildCreate = function() {
            UserService.locationAndBuilding.query({}, function(response) {
                for (var i = 0; i < response.length; i++) {
                    response[i].children = [];
                    for (var j = 0; j < response[i].buildings.length; j++) {
                        var co
                        response[i].buildings[j].text = response[i].buildings[j].building_name;
                        response[i].buildings[j].id = response[i].buildings[j]._id;
                        response[i].buildings[j].type = 'building';
                    }
                    response[i].children = response[i].buildings;
                    response[i].id = response[i]._id;
                    response[i].text = response[i].name;
                    response[i].type = 'location';
                }
                $scope.initializeTree(response)
            })
        };

        /**
         * fetch location and building & convert to json format required by jsTree & added selected field so location & building
         * is auto selected if already present in user database
         */
        $scope.initLocBuildUpdate = function() {
            var locationHasBuilding = true;
            UserService.locationAndBuilding.query({}, function(response) {
                UserService.users.get({
                    createuserId: $stateParams.userId
                }, function(user) {
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].buildings.length > 0) {
                            for (var j = 0; j < response[i].buildings.length; j++) {
                                response[i].buildings[j].text = response[i].buildings[j].building_name;
                                response[i].buildings[j].type = 'building';
                                response[i].buildings[j].id = response[i].buildings[j]._id;
                                for (var k = 0; k < user.buildings.length; k++) {
                                    if (JSON.stringify(response[i].buildings[j]._id) == JSON.stringify(user.buildings[k])) {
                                        response[i].buildings[j].state = {
                                            selected: true,
                                            disabled: utilityService.isSecurityManager(user.role._id)
                                        }
                                    }
                                }
                                response[i].state = {
                                    disabled: utilityService.isSecurityManager(user.role._id)
                                }
                            }
                        } else {
                            locationHasBuilding = false;
                        }
                        response[i].children = response[i].buildings;
                        response[i].text = response[i].name;
                        response[i].id = response[i]._id;
                        response[i].type = 'location';
                        if (locationHasBuilding == false) {
                            for (var k = 0; k < user.locations.length; k++) {
                                if (JSON.stringify(response[i]._id) == JSON.stringify(user.locations[k])) {
                                    response[i].state = {
                                        selected: true
                                    }
                                }
                            }
                        }
                    }
                    $scope.initializeTree(response);
                })
            })
        };

        $scope.checkLocation = function() {
            UserService.currentUser.get({}, function(user) {
                if (user.buildings.length < 1) {
                    var title = "No Building Found.";
                    var message = "Please add building first, do you want to create building?";
                    $location.path(USERS.URL_PATH.USER_LIST);
                    utilityService.genericConfirm(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = BUILDING.PATH.BUILDING_ADD;
                    });
                }
            })
        };

        $scope.cancel = function() {
            $location.path("/");
        };
    }
})();
