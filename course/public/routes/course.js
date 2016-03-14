'use strict';

angular.module('mean.course').config(['$stateProvider', 'COURSE',
    function ($stateProvider, COURSE) {
        $stateProvider
            .state(COURSE.STATE.COURSE_ADMIN, {
                url: COURSE.URL_PATH.COURSE_ADMIN,
                templateUrl: COURSE.FILE_PATH.COURSE_ADMIN,
                abstract: true
            })
            .state(COURSE.STATE.COURSE, {
                url: COURSE.URL_PATH.COURSE,
                templateUrl: COURSE.FILE_PATH.COURSE,
                abstract: true
            })
            .state(COURSE.STATE.ADMIN_COURSE_LIST, {
                url: COURSE.URL_PATH.ADMIN_COURSE_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_EDIT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_LIST, {
                url: COURSE.URL_PATH.COURSE_LIST,
                templateUrl: COURSE.FILE_PATH.COURSE_LIST,
                /*resolve: {
                 loggedin: function (MeanUser) {
                 return MeanUser.checkLoggedin();
                 }
                 }*/
            })
            .state(COURSE.STATE.COURSE_LIST_DETAILS, {
                url: COURSE.URL_PATH.COURSE_LIST_DETAILS,
                templateUrl: COURSE.FILE_PATH.COURSE_LIST_DETAILS,
                /*resolve: {
                 loggedin: function (MeanUser) {
                 return MeanUser.checkLoggedin();
                 }
                 }*/
            })
            .state(COURSE.STATE.COURSE_TABS, {
                url: COURSE.URL_PATH.COURSE_TABS,
                templateUrl: COURSE.FILE_PATH.COURSE_TABS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_MY_COURSES, {
                url: COURSE.URL_PATH.COURSE_MY_COURSES,
                templateUrl: COURSE.FILE_PATH.COURSE_MY_COURSES,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_SELECTED, {
                url: COURSE.URL_PATH.COURSE_SELECTED,
                templateUrl: COURSE.FILE_PATH.COURSE_SELECTED,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_PAYMENT, {
                url: COURSE.URL_PATH.COURSE_PAYMENT,
                templateUrl: COURSE.FILE_PATH.COURSE_PAYMENT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_FORM_CREATE, {
                url: COURSE.URL_PATH.COURSE_FORM_CREATE,
                templateUrl: COURSE.FILE_PATH.COURSE_FORM_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_BATCH_CREATE, {
                url: COURSE.URL_PATH.ADMIN_BATCH_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_BATCH_LIST, {
                url: COURSE.URL_PATH.ADMIN_BATCH_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_BATCH_EDIT, {
                url: COURSE.URL_PATH.ADMIN_BATCH_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_USER_COUNSELLING_LIST, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_USER_COUNSELLING_EDIT, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_TEST_REDIRECT, {
                url: COURSE.URL_PATH.COURSE_TEST_REDIRECT,
                templateUrl: COURSE.FILE_PATH.COURSE_TEST_REDIRECT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_CURRICULUM, {
                url: COURSE.URL_PATH.COURSE_CURRICULUM,
                templateUrl: COURSE.FILE_PATH.COURSE_CURRICULUM,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })

            .state(COURSE.STATE.ADMIN_COURSE_REQUEST, {
                url: COURSE.URL_PATH.ADMIN_COURSE_REQUEST,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_REQUEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_STUDENT_LIST, {
                url: COURSE.URL_PATH.ADMIN_STUDENT_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_STUDENT_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.STUDENT_METRICS, {
                url: COURSE.URL_PATH.STUDENT_METRICS,
                templateUrl: COURSE.FILE_PATH.STUDENT_METRICS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_STUDENT_MANAGE, {
                url: COURSE.URL_PATH.ADMIN_STUDENT_MANAGE,
                templateUrl: COURSE.FILE_PATH.ADMIN_STUDENT_MANAGE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_LOAN, {
                url: COURSE.URL_PATH.ADMIN_COURSE_LOAN,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_LOAN,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_LOAN_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_LOAN_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_LOAN_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_ONLINETEST, {
                url: COURSE.URL_PATH.COURSE_ONLINETEST,
                templateUrl: COURSE.FILE_PATH.COURSE_ONLINETEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.STUDENT_EDITPROFILE, {
                url: COURSE.URL_PATH.STUDENT_EDITPROFILE,
                templateUrl: COURSE.FILE_PATH.STUDENT_EDITPROFILE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_DISCOUNT, {
                url: COURSE.URL_PATH.COURSE_DISCOUNT,
                templateUrl: COURSE.FILE_PATH.COURSE_DISCOUNT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.MY_COURSE, {
                url: COURSE.URL_PATH.MY_COURSE,
                templateUrl: COURSE.FILE_PATH.MY_COURSE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_COURSE_MATERIALS, {
                url: COURSE.URL_PATH.COURSE_COURSE_MATERIALS,
                templateUrl: COURSE.FILE_PATH.COURSE_COURSE_MATERIALS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_SCHEDULE, {
                url: COURSE.URL_PATH.COURSE_SCHEDULE,
                templateUrl: COURSE.FILE_PATH.COURSE_SCHEDULE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_MENTOR, {
                url: COURSE.URL_PATH.COURSE_MENTOR,
                templateUrl: COURSE.FILE_PATH.COURSE_MENTOR,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_BATCH_MATES, {
                url: COURSE.URL_PATH.COURSE_BATCH_MATES,
                templateUrl: COURSE.FILE_PATH.COURSE_BATCH_MATES,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_TEST, {
                url: COURSE.URL_PATH.COURSE_TEST,
                templateUrl: COURSE.FILE_PATH.COURSE_TEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.MY_COURSE_CURRICULUM, {
                url: COURSE.URL_PATH.MY_COURSE_CURRICULUM,
                templateUrl: COURSE.FILE_PATH.MY_COURSE_CURRICULUM,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COUNSELLING_REQUEST, {
                url: COURSE.URL_PATH.COUNSELLING_REQUEST,
                templateUrl: COURSE.FILE_PATH.COUNSELLING_REQUEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.MY_COURSE_INVEST, {
                url: COURSE.URL_PATH.MY_COURSE_INVEST,
                templateUrl: COURSE.FILE_PATH.MY_COURSE_INVEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_INSTALLMENT_FORM, {
                url: COURSE.URL_PATH.COURSE_INSTALLMENT_FORM,
                templateUrl: COURSE.FILE_PATH.COURSE_INSTALLMENT_FORM,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_EDIT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_EDIT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_MATERIAL, {
                url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_MATERIAL_CREATE, {
                url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_MATERIAL_EDIT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COURSE_BRANCH_ASSIGNMENT, {
                url: COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })

            .state(COURSE.STATE.ADMIN_COURSE_PAYMENT_SCHEME, {
                url: COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_PAYMENT_SCHEME,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }

                }
            })
            .state(COURSE.STATE.ADMIN_HOLIDAY_CREATE, {
                url: COURSE.URL_PATH.ADMIN_HOLIDAY_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_CURRICULUM_TOPICS, {
                url: COURSE.URL_PATH.ADMIN_CURRICULUM_TOPICS,
                templateUrl: COURSE.FILE_PATH.ADMIN_CURRICULUM_TOPICS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_HOLIDAY_LIST, {
                url: COURSE.URL_PATH.ADMIN_HOLIDAY_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_HOLIDAY_EDIT, {
                url: COURSE.URL_PATH.ADMIN_HOLIDAY_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_FRANCHISE_CREATE, {
                url: COURSE.URL_PATH.ADMIN_FRANCHISE_CREATE,
                templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_FRANCHISE_LIST, {
                url: COURSE.URL_PATH.ADMIN_FRANCHISE_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_FRANCHISE_EDIT, {
                url: COURSE.URL_PATH.ADMIN_FRANCHISE_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_FRANCHISE_VIEW, {
                url: COURSE.URL_PATH.ADMIN_FRANCHISE_VIEW,
                templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_PROJECT_LIST, {
                url: COURSE.URL_PATH.COURSE_PROJECT_LIST,
                templateUrl: COURSE.FILE_PATH.COURSE_PROJECT_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_PROJECT_CREATE, {
                url: COURSE.URL_PATH.COURSE_PROJECT_CREATE,
                templateUrl: COURSE.FILE_PATH.COURSE_PROJECT_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_PROJECT_EDIT, {
                url: COURSE.URL_PATH.COURSE_PROJECT_EDIT,
                templateUrl: COURSE.FILE_PATH.COURSE_PROJECT_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_PROJECT_DETAILS, {
                url: COURSE.URL_PATH.COURSE_PROJECT_DETAILS,
                templateUrl: COURSE.FILE_PATH.COURSE_PROJECT_DETAILS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_BATCH_ATTENDANCE, {
                url: COURSE.URL_PATH.ADMIN_BATCH_ATTENDANCE,
                templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_ATTENDANCE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.STUDENT_DETAILS, {
                url: COURSE.URL_PATH.STUDENT_DETAILS,
                templateUrl: COURSE.FILE_PATH.STUDENT_DETAILS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.STUDENT_COUNSELLING_REQUEST_STATUS, {
                url: COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST_STATUS,
                templateUrl: COURSE.FILE_PATH.STUDENT_COUNSELLING_REQUEST_STATUS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.STUDENT_COUNSELLING_REQUEST, {
                url: COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST,
                templateUrl: COURSE.FILE_PATH.STUDENT_COUNSELLING_REQUEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.CALENDAR, {
                url: COURSE.URL_PATH.CALENDAR,
                templateUrl: COURSE.FILE_PATH.CALENDAR,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_BATCH_VIEW, {
                url: COURSE.URL_PATH.ADMIN_BATCH_VIEW,
                templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.MENTOR_ASSIGNMENT, {
                url: COURSE.URL_PATH.MENTOR_ASSIGNMENT,
                templateUrl: COURSE.FILE_PATH.MENTOR_ASSIGNMENT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_REQUEST_VIEW, {
                url: COURSE.URL_PATH.COURSE_REQUEST_VIEW,
                templateUrl: COURSE.FILE_PATH.COURSE_REQUEST_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_DETAILS, {
                url: COURSE.URL_PATH.COURSE_DETAILS,
                templateUrl: COURSE.FILE_PATH.COURSE_DETAILS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL, {
                url: COURSE.URL_PATH.COURSE_MATERIAL,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_CHAPTER, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_CHAPTER,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_CHAPTER,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_VIEW, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_VIEW,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_EDIT, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_EDIT,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_TITLE_LIST, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_TITLE_LIST,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_TITLE_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.ADMIN_COUNSELLING_CREATE_SCHEDULE, {
                url: COURSE.URL_PATH.ADMIN_COUNSELLING_CREATE_SCHEDULE,
                templateUrl: COURSE.FILE_PATH.ADMIN_COUNSELLING_CREATE_SCHEDULE

            })
            .state(COURSE.STATE.COURSE_STUDENT_PAYMENT, {
                url: COURSE.URL_PATH.COURSE_STUDENT_PAYMENT,
                templateUrl: COURSE.FILE_PATH.COURSE_STUDENT_PAYMENT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.MY_COURSE_DETAILS, {
                url: COURSE.URL_PATH.MY_COURSE_DETAILS,
                templateUrl: COURSE.FILE_PATH.MY_COURSE_DETAILS,
            })
            .state(COURSE.STATE.COURSE_REQUEST, {
                url: COURSE.URL_PATH.COURSE_REQUEST,
                templateUrl: COURSE.FILE_PATH.COURSE_REQUEST,

            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_REQUEST_LIST, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_REQUEST_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_REQUEST_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.STUDENT_COURSE_REQUEST_VIEW, {
                url: COURSE.URL_PATH.STUDENT_COURSE_REQUEST_VIEW,
                templateUrl: COURSE.FILE_PATH.STUDENT_COURSE_REQUEST_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_MATERIAL_CHAPTER_EDIT, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_CHAPTER_EDIT,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_CHAPTER_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_TOPIC_EDIT, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_TOPIC_EDIT,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_TOPIC_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.COURSE_MATERIAL_SUB_TOPIC_EDIT, {
                url: COURSE.URL_PATH.COURSE_MATERIAL_SUB_TOPIC_EDIT,
                templateUrl: COURSE.FILE_PATH.COURSE_MATERIAL_SUB_TOPIC_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.MY_COURSE_PAYMENT_SCHEDULE, {
                url: COURSE.URL_PATH.MY_COURSE_PAYMENT_SCHEDULE,
                templateUrl: COURSE.FILE_PATH.MY_COURSE_PAYMENT_SCHEDULE,

            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COUNSELLING_CHECKLIST_CREATE, {
                url: COURSE.URL_PATH.COUNSELLING_CHECKLIST_CREATE,
                templateUrl: COURSE.FILE_PATH.COUNSELLING_CHECKLIST_CREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COUNSELLING_CHECKLIST_EDIT, {
                url: COURSE.URL_PATH.COUNSELLING_CHECKLIST_EDIT,
                templateUrl: COURSE.FILE_PATH.COUNSELLING_CHECKLIST_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW, {
                url: COURSE.URL_PATH.ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW,
                templateUrl: COURSE.FILE_PATH.ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COUNSELLING_CHECKLIST, {
                url: COURSE.URL_PATH.COUNSELLING_CHECKLIST,
                templateUrl: COURSE.FILE_PATH.COUNSELLING_CHECKLIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.COURSE_LIST_STUDENT, {
                url: COURSE.URL_PATH.COURSE_LIST_STUDENT,
                templateUrl: COURSE.FILE_PATH.COURSE_LIST_STUDENT
            })
            .state(COURSE.STATE.ADMIN_COURSE_BRANCH_VIEW, {
                url: COURSE.URL_PATH.ADMIN_COURSE_BRANCH_VIEW,
                templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_BRANCH_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(COURSE.STATE.BATCH_LIST_STUDENT, {
                url: COURSE.URL_PATH.BATCH_LIST_STUDENT,
                templateUrl: COURSE.FILE_PATH.BATCH_LIST_STUDENT
            })

            .state(COURSE.STATE.BATCH_EDIT_STUDENT, {
                url: COURSE.URL_PATH.BATCH_EDIT_STUDENT,
                templateUrl: COURSE.FILE_PATH.BATCH_EDIT_STUDENT
            })
            .state(COURSE.STATE.COUNSELLING_CHECKLIST_VIEW, {
                url: COURSE.URL_PATH.COUNSELLING_CHECKLIST_VIEW,
                templateUrl: COURSE.FILE_PATH.COUNSELLING_CHECKLIST_VIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(COURSE.STATE.STUDENT_COUNSELLING_CHECKLIST, {
                url: COURSE.URL_PATH.STUDENT_COUNSELLING_CHECKLIST,
                templateUrl: COURSE.FILE_PATH.STUDENT_COUNSELLING_CHECKLIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
             .state(COURSE.STATE.COURSE_PAYMENT_DETAIL, {
                url: COURSE.URL_PATH.COURSE_PAYMENT_DETAIL,
                templateUrl: COURSE.FILE_PATH.COURSE_PAYMENT_DETAIL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            });
    }
]);