'use strict';

angular.module('mean.course').controller('FranchiseeController', function ($scope, $stateParams, FranchiseService, $location, $rootScope, flash, URLFactory) {
    $scope.URLFactory = URLFactory;
    $scope.SERVICE = FranchiseService;
    $scope.package = {
        name: 'course',
        modelName: 'Franchise',
        featureName: 'Franchises'

    };
    initializeDeletePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, URLFactory.uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, URLFactory.COURSE.PATH.ADMIN_FRANCHISE_LIST);
    pageTitleMessage($scope,URLFactory.translate,'course.franchise.WELCOME','course.franchise.TITLE_DESC');
    initializePagination($scope, $rootScope, FranchiseService);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, URLFactory.MESSAGES);

    //Bread crumbs
    $scope.createBreadcrumb = function () {
        $scope.breadCrumAdd("Create");
    };

    $scope.editBreadcrumb = function () {
        $scope.breadCrumAdd("Edit");
    };

    //For Radio buttons
    $scope.courseType = false;

    $scope.courseTypes = [
        {

            _id: '1',
            name: 'Franchise'
        },
        {
            _id: '2',
            name: 'Third Party Provider'
        }
    ];

    $scope.selectedCourseType = function (id) {
        $scope.courseTypeId = id;
        if ($scope.courseTypeId == 1 || $scope.courseTypeId == 2) {
            $scope.courseType = true;
            $scope.thirdPartyCourseType = true;
        }
        else {
            $scope.courseType = false;
            $scope.thirdPartyCourseType = false;
        }
    };

    $scope.findCourseType = function () {
        $scope.courseTypeId = 1;
        $scope.courseType = true;
    };

    // Loads multiple contact details
    $scope.franchise = {};

    $scope.franchise.contactDetails = [
        {}
    ];

    $scope.addContactDetails = function () {
        $scope.franchise.contactDetails.push({});
    };

    $scope.removeContactDetails = function (contactDetails) {
        var index = $scope.franchise.contactDetails.indexOf(contactDetails);
        $scope.franchise.contactDetails.splice(index, 1);
    };


    //Create
    $scope.create = function (isvalid) {
        if ($scope.writePermission) {
            if (isvalid) {
                var franchise = new FranchiseService.franchise($scope.franchise);

                franchise.$save(function (response) {
                    flash.setMessage(URLFactory.MESSAGES.FRANCHISE_ADD_SUCCESS,
                        URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.COURSE.PATH.ADMIN_FRANCHISE_LIST);
                    $scope.franchise = {};
                }, function (error) {
                    $scope.error = error;
                });
            }
            else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    //Update
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var franchise = $scope.franchise;
                if (!franchise.updated) {
                    franchise.updated = [];
                }
                franchise.updated.push(new Date().getTime());
                franchise.$update(function () {
                    flash.setMessage(URLFactory.MESSAGES.FRANCHISE_UPDATE_SUCCESS,
                        URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.COURSE.PATH.ADMIN_FRANCHISE_LIST);
                }, function (error) {
                    $scope.error = error;

                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };


    //Delete
    $scope.remove = function (Franchise) {
        if (Franchise && $scope.deletePermission) {
            var franchise = new FranchiseService.franchise(Franchise);
            franchise.$remove(function (response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === Franchise) {
                        $scope.collection.splice(i, 1);
                    }
                    $('#deletePopup').modal("hide");
                    flash.setMessage(URLFactory.MESSAGES.FRANCHISE_DELETE_SUCCESS,
                        URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.COURSE.PATH.ADMIN_FRANCHISE_LIST);
                }


            });
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    //Show
    $scope.findOne = function () {

        if ($scope.updatePermission) {
            FranchiseService.franchise.get({
                franchiseId: $stateParams.franchiseId
            }, function (franchise) {
                $scope.franchise = franchise;
            });
        }
        else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };


    /*
     * Cancel
     */
    $scope.cancelFranchise = function () {
        $location.path(URLFactory.COURSE.PATH.ADMIN_FRANCHISE_LIST);
    };

    $scope.newFranchise = function () {
        $location.path(URLFactory.COURSE.PATH.ADMIN_FRANCHISE_CREATE);
    };

    $scope.editFranchise = function (urlPath, id) {
        urlPath = urlPath.replace(":franchiseId", id);
        $location.path(urlPath);
    };

    $scope.viewFranchise = function (urlPath, id) {
        urlPath = urlPath.replace(":franchiseId", id);
        $location.path(urlPath);
    };
    /*
     * Show page
     */
    $scope.findShow = function () {
        FranchiseService.franchise.get({
            franchiseId: $stateParams.franchiseId
        }, function (franchise) {
            $scope.franchise = franchise;
            $scope.breadCrumAdd("Detail");
        });
    };
});