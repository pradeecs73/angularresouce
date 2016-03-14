'use strict';

angular.module('mean.users').controller('LoginCtrl', function ($rootScope, MeanUser, $location, $scope, $timeout, flash, $cookies,URLFactory) {
    $scope.URLFactory = URLFactory;
    var vm = this;

    vm.user = {};
    var queryParams = $location.search();
    switch (queryParams.confirmation || queryParams.errorcode) {
        case "0":
            flash.setMessage(URLFactory.USERS.MESSAGES.USER_VERIFIED, URLFactory.MESSAGES.SUCCESS);
            break;
        case "1":
            flash.setMessage(URLFactory.USERS.URLFactory.MESSAGES.NOT_CONFIRMED, URLFactory.MESSAGES.ERROR);
            break;
        case "2":
            flash.setMessage(URLFactory.USERS.URLFactory.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, URLFactory.MESSAGES.ERROR);
            break;
        case "3":
            flash.setMessage(URLFactory.USERS.URLFactory.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, URLFactory.MESSAGES.ERROR);
            break;
        case "7":
            flash.setMessage(URLFactory.USERS.URLFactory.MESSAGES.DIFFERENT_PROVIDER, URLFactory.MESSAGES.ERROR);
            break;
    }

    $rootScope.$on('loggedin', function () {
        var enrollCourseIdCookie = $cookies.get('enrollCourseId');
        if (enrollCourseIdCookie) {
            var urlPath = URLFactory.COURSE.URL_PATH.COURSE_DETAILS;
            urlPath = urlPath.replace(":courseId", enrollCourseIdCookie);
            $location.path(urlPath);
        } else {
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    });

    vm.input = {
        type: 'password',
        placeholder: 'Password',
        confirmPlaceholder: 'Repeat Password',
        iconClass: '',
        tooltipText: 'Show password'
    };

    vm.togglePasswordVisible = function () {
        vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
        vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
    };

    $rootScope.$on('loginfailed', function () {
        flash.setMessage(MeanUser.loginError, URLFactory.MESSAGES.ERROR);
    });

    // Register the login() function
    vm.login = function (form) {
        if (form.$invalid) {
            $scope.inValidForm = true;
            form.$setDirty();
        } else {
            MeanUser.login(this.user);
        }

    };
});
