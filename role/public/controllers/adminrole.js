angular.module('mean.role')
    .controller('AdminRoleController',
    function ($scope, $rootScope, $stateParams, $location, Global, RoleService, UserService, MESSAGES, flash,AdminRoleService,USERS) {
        $scope.global = Global;
        $scope.package = {
            name: 'Role',
            modelName: 'User',
            featureName: 'Roles'
        };
        /*console.log("ROle controller is loaded");
        $scope.ROLE = ROLE;*/
        $scope.MESSAGES = MESSAGES;
        $scope.SERVICE = AdminRoleService;

        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

        initializeBreadCrum($scope, $scope.package.modelName, USERS.URL_PATH.LISTROLE);

        initializePagination($scope, $rootScope, $scope.SERVICE);

        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES);

        $scope.hasAuthorization = function (role) {
            if (!role || !role.user) {
                return false;
            }
            return MeanUser.isAdmin || role.user._id === MeanUser.user._id;
        };
        
    });