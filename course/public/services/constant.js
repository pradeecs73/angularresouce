angular.module('mean.course').constant('COURSE', {
    URL_PATH: {
        COURSE_ADMIN: '/admin',

        ADMIN_COURSE_LIST: '/course',
        ADMIN_COURSE_CREATE: '/course/create',
        ADMIN_COURSE_EDIT: '/course/:courseId/edit',

        ADMIN_BATCH_CREATE: '/batch/create',
        ADMIN_BATCH_LIST: '/batch/:courseId/list',
        ADMIN_BATCH_EDIT: '/batch/:batchId/edit',
        ADMIN_BATCH_VIEW: '/batch/:batchId/view',

        ADMIN_BATCH_ATTENDANCE: '/batch/:batchId/attendance',

        ADMIN_USER_COUNSELLING_LIST: '/userCounselling/list',
        ADMIN_USER_COUNSELLING_EDIT: '/userCounselling/:userCounsellingId/edit',
        ADMIN_STUDENT_LIST: '/course/student_list',
        STUDENT_METRICS: '/student/metrics',
        ADMIN_STUDENT_MANAGE: '/course/student_manage',
        ADMIN_COURSE_CURRICULUM: '/course/curriculum',
        ADMIN_COURSE_CURRICULUM_CREATE: '/course/curriculum/create',
        ADMIN_COURSE_CURRICULUM_EDIT: '/course/curriculum/edit',
        ADMIN_COURSE_CURRICULUM_SESSION: '/course/curriculum/session',
        ADMIN_COURSE_CURRICULUM_SESSION_CREATE: '/course/curriculum/session/create',
        ADMIN_COURSE_CURRICULUM_SESSION_EDIT: '/course/curriculum/session/edit',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC: '/course/curriculum/session/topic',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE: '/course/curriculum/session/topic/create',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT: '/course/curriculum/session/topic/edit',
        ADMIN_COURSE_MATERIAL: '/course/material',
        ADMIN_COURSE_MATERIAL_CREATE: '/course/material/create',
        ADMIN_COURSE_MATERIAL_EDIT: '/course/material/edit',
        ADMIN_CURRICULUM_TOPICS:'/course/:courseId/topic',

        ADMIN_HOLIDAY_CREATE: '/holiday/create',
        ADMIN_HOLIDAY_LIST: '/holiday',
        ADMIN_HOLIDAY_EDIT: '/holiday/:holidayId/edit',


        ADMIN_FRANCHISE_CREATE: '/franchisee/create',
        ADMIN_FRANCHISE_LIST: '/franchisee',
        ADMIN_FRANCHISE_EDIT: '/franchisee/:franchiseId/edit',
        ADMIN_FRANCHISE_VIEW: '/franchisee/:franchiseId/detail',

        COURSE_PROJECT_LIST: '/courseproject',
        COURSE_PROJECT_CREATE: '/courseproject/create',
        COURSE_PROJECT_EDIT: '/courseproject/:courseprojectId/edit',
        COURSE_PROJECT_DETAILS: '/courseproject/:courseprojectId/detail',

        ADMIN_COURSE_BRANCH_ASSIGNMENT: '/course-branch/assignment',
        ADMIN_COURSE_PAYMENT_SCHEME: '/course/:courseId/branch/assignment',
        ADMIN_USER_COUNSELLING_REQUEST_LIST : '/usercounselling/list',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL : '/course/counselling/scheduleReq/edit',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL : '/course/counselling/scheduleReq/viewDetail',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST : '/course/counselling/create/list',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT : '/course/counselling/:branchId/create/list/editschedule',
        ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW : '/course/counselling/mentor/schedulelist',
        ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW : '/course/counselling/mentor/scheduledetail',
        ADMIN_COURSE_REQUEST: '/courserequest',
        ADMIN_COURSE_LOAN: '/course/loans',
        ADMIN_COURSE_LOAN_CREATE: '/course/loans/create',
        ADMIN_COUNSELLING_CREATE_SCHEDULE: '/counsellingCreate',
        COUNSELLING_CHECKLIST_CREATE:'/course/:courseId/counselling/counsellingchecklist/create',
        COUNSELLING_CHECKLIST_EDIT:'/course/:courseId/counselling/:checklistId/edit',
        COUNSELLING_CHECKLIST:'/counselling/:courseId/checklist',
        ADMIN_COURSE_BRANCH_VIEW:'/course/:courseId/branch/payment-scheme/view',
        COUNSELLING_CHECKLIST_VIEW:'/course/:courseId/counselling/:checklistId/view',

        COURSE: '/course',
        COURSE_LIST: '/courseList',
        COURSE_LIST_DETAILS: '/courseDetails/:courseId',
        COURSE_TABS: '/courseTabs',
        COURSE_MY_COURSES: '/myCourses',
        COURSE_SELECTED: '/course_selected',
        COURSE_PAYMENT: '/payment',
        COURSE_FORM_CREATE: '/form_create',
        COURSE_TEST_REDIRECT: '/test/redirect',
        COURSE_CURRICULUM: '/curriculum',
        COURSE_ONLINETEST: '/views/student_onlinetest',
        STUDENT_EDITPROFILE: '/student/editProfile',
        COURSE_DISCOUNT: '/discount',
        MY_COURSE: '/mycourse',
        COURSE_COURSE_MATERIALS: '/coursematerials',
        COURSE_SCHEDULE: '/schedule',
        COURSE_MENTOR: '/mentor',
        COURSE_BATCH_MATES: '/batchmates',
        COURSE_TEST: '/test',
        MY_COURSE_CURRICULUM: '/mycourse/curriculum',
        COUNSELLING_REQUEST: '/request',
        MY_COURSE_INVEST: '/invest',
        COURSE_INSTALLMENT_FORM: '/course-management',
        STUDENT_COUNSELLING_REQUEST: '/student/:courseData/:branchData/counsellingRequest',
        STUDENT_COUNSELLING_REQUEST_STATUS: '/student/counsellingStatus',
        PAYMENT_SCHEDULE:'/:courseId/paymentschedule',
        MENTOR_ASSIGNMENT: '/mentorassignment',
        COURSE_REQUEST_VIEW: '/courseRequest/:courseRequestId/details',
        STUDENT_DETAILS:'/student/studentdetails',
        COURSE_DETAILS : '/student/:courseId/courseDetails',
        CALENDAR : '/calendar',
        COURSE_MATERIAL_LESSON: '/:courseId/chapter/:chapterId/lesson/:lessonId',
        COURSE_MATERIAL: '/material/create',
        COURSE_MATERIAL_CHAPTER: '/:courseId/chapter/:chapterId',
        COURSE_MATERIAL_EDIT: '/material/:materialTitleId/edit',
        COURSE_MATERIAL_CHAPTER_EDIT: '/material/:materialTitleId/chapter/:chapterId/edit',
        COURSE_MATERIAL_LESSON_EDIT: '/material/:materialTitleId/lesson/:lessonId/edit',
        COURSE_MATERIAL_TOPIC_EDIT: '/material/:materialTitleId/topic/:topicId/edit',
        COURSE_MATERIAL_SUB_TOPIC_EDIT: '/material/:materialTitleId/subTopic/:subTopicId/edit',
        COURSE_MATERIAL_VIEW: '/material/:materialTitleId/list',
        COURSE_MATERIAL_TITLE_LIST: '/material/list',
        COURSE_PAYMENT : '/student/:courseId/coursePayment',
        MY_COURSE_DETAILS:'/mycourse/:courseId/coursedetails',
        COURSE_REQUEST: '/mycourse/courseRequests',
        STUDENT_COURSE_REQUEST_VIEW :'/myrequest/:courseRequestId/courseRequestdetails',
        MY_COURSE_PAYMENT_SCHEDULE:'/mycourse/:courseId/coursePaymentSchedule',
        COURSE_LIST_STUDENT:'/:courseId/student/list',
        COURSE_LIST_STUDENT:'/:courseId/students',
        BATCH_LIST_STUDENT:'/:courseId/batch/:batchId/students',
        BATCH_EDIT_STUDENT:'/:batchstudentId/course/:courseId/batch/:batchId/student/:studentId',
        STUDENT_COUNSELLING_CHECKLIST:'/student/counselling/checklist',
        COURSE_PAYMENT_DETAIL: '/student/paymentDetail'
    },
    PATH: {
        ADMIN_COURSE_LIST: '/admin/course',
        ADMIN_COURSE_CREATE: '/admin/course/create',
        ADMIN_COURSE_EDIT: '/admin/course/:courseId/edit',

        ADMIN_BATCH_CREATE: '/admin/batch/create',
        ADMIN_BATCH_LIST: '/admin/batch/:courseId/list',
        ADMIN_BATCH_EDIT: '/admin/batch/:batchId/edit',
        ADMIN_BATCH_VIEW: '/admin/batch/:batchId/view',

        ADMIN_BATCH_ATTENDANCE: '/admin/batch/:batchId/attendance',

        ADMIN_USER_COUNSELLING_LIST: '/admin/userCounselling/list',
        ADMIN_USER_COUNSELLING_EDIT: '/admin/userCounselling/:userCounsellingId/edit',
        ADMIN_STUDENT_LIST: '/admin/course/student_list',
        STUDENT_METRICS: '/admin/student/metrics',
        ADMIN_STUDENT_MANAGE: '/admin/course/student_manage',
        ADMIN_COURSE_CURRICULUM: '/admin/course/curriculum',
        ADMIN_COURSE_CURRICULUM_CREATE: '/admin/course/curriculum/create',
        ADMIN_COURSE_CURRICULUM_EDIT: '/admin/course/curriculum/edit',
        ADMIN_COURSE_CURRICULUM_SESSION: '/admin/course/curriculum/session',
        ADMIN_COURSE_CURRICULUM_SESSION_CREATE: '/admin/course/curriculum/session/create',
        ADMIN_COURSE_CURRICULUM_SESSION_EDIT: '/admin/course/curriculum/session/edit',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC: '/admin/course/curriculum/session/topic',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE: '/admin/course/curriculum/session/topic/create',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT: '/admin/course/curriculum/session/topic/edit',
        ADMIN_COURSE_MATERIAL: '/admin/course/material',
        ADMIN_COURSE_MATERIAL_CREATE: '/admin/course/material/create',
        ADMIN_COURSE_MATERIAL_EDIT: '/admin/course/material/edit',
        ADMIN_CURRICULUM_TOPICS:'/admin/course/:courseId/topic',

        ADMIN_HOLIDAY_CREATE: '/admin/holiday/create',
        ADMIN_HOLIDAY_LIST: '/admin/holiday',
        ADMIN_HOLIDAY_EDIT: '/admin/holiday/:holidayId/edit',

        ADMIN_FRANCHISE_CREATE: '/admin/franchisee/create',
        ADMIN_FRANCHISE_LIST: '/admin/franchisee',
        ADMIN_FRANCHISE_EDIT: '/admin/franchisee/:franchiseId/edit',
        ADMIN_FRANCHISE_VIEW: '/admin/franchisee/:franchiseId/detail',

        COURSE_PROJECT_LIST: '/admin/courseproject',
        COURSE_PROJECT_CREATE: '/admin/courseproject/create',
        COURSE_PROJECT_EDIT: '/admin/courseproject/:courseprojectId/edit',
        COURSE_PROJECT_DETAILS: '/admin/courseproject/:courseprojectId/details',

        ADMIN_COURSE_BRANCH_ASSIGNMENT: '/admin/course-branch/assignment',
        ADMIN_COURSE_PAYMENT_SCHEME: '/admin/course/:courseId/branch/assignment',
        ADMIN_USER_COUNSELLING_REQUEST_LIST : '/admin/usercounselling/list',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL : '/admin/course/counselling/scheduleReq/edit',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL : '/admin/course/counselling/scheduleReq/viewDetail',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST : '/admin/course/counselling/create/list',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT : '/admin/course/counselling/:branchId/create/list/editschedule',
        ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW : '/admin/course/counselling/mentor/schedulelist',
        ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW : '/admin/course/counselling/mentor/scheduledetail',
        ADMIN_COURSE_REQUEST: '/admin/courserequest',
        ADMIN_COURSE_LOAN: '/admin/course/loans',
        ADMIN_COURSE_LOAN_CREATE: '/admin/course/loans/create',
        ADMIN_COUNSELLING_CREATE_SCHEDULE: '/admin/counsellingCreate',
        COUNSELLING_CHECKLIST_CREATE:'/admin/course/:courseId/counselling/counsellingchecklist/create',
        COUNSELLING_CHECKLIST_EDIT:'/admin/course/:courseId/counselling/:checklistId/edit',
        COUNSELLING_CHECKLIST:'/admin/counselling/:courseId/checklist',
        ADMIN_COURSE_BRANCH_VIEW:'/admin/course/:courseId/branch/payment-scheme/view',
        COUNSELLING_CHECKLIST_VIEW:'/admin/course/:courseId/counselling/:checklistId/view',


        COURSE: '/course',
        COURSE_LIST: '/course/courseList',
        COURSE_LIST_DETAILS: '/course/courseDetails/:courseId',
        COURSE_TABS: '/course/courseTabs',
        COURSE_MY_COURSES: '/course/myCourses',
        COURSE_SELECTED: '/course/course_selected',
        COURSE_PAYMENT: '/course/payment',
        COURSE_FORM_CREATE: '/course/form_create',
        COURSE_TEST_REDIRECT: '/course/test/redirect',
        COURSE_CURRICULUM: '/course/curriculum',
        COURSE_ONLINETEST: '/course/views/student_onlinetest',
        STUDENT_EDITPROFILE: '/course/student/editProfile',
        COURSE_DISCOUNT: '/course/discount',
        MY_COURSE: '/course/mycourse',
        COURSE_COURSE_MATERIALS: '/course/coursematerials',
        COURSE_SCHEDULE: '/course/schedule',
        COURSE_MENTOR: '/course/mentor',
        COURSE_BATCH_MATES: '/course/batchmates',
        COURSE_TEST: '/course/test',
        MY_COURSE_CURRICULUM: '/course/mycourse/curriculum',
        COUNSELLING_REQUEST: '/course/request',
        MY_COURSE_INVEST: '/course/invest',
        COURSE_INSTALLMENT_FORM: '/course/course-management',
        STUDENT_COUNSELLING_REQUEST: '/course/student/:courseData/:branchData/counsellingRequest',
        STUDENT_COUNSELLING_REQUEST_STATUS: '/course/student/counsellingStatus',
        PAYMENT_SCHEDULE:'/course/:courseId/paymentschedule',
        MENTOR_ASSIGNMENT: '/course/mentorassignment',
        COURSE_REQUEST_VIEW: '/course/courseRequest/:courseRequestId/details',
        STUDENT_DETAILS:'/course/student/studentdetails',
        COURSE_DETAILS : '/course/student/:courseId/courseDetails',
        CALENDAR : '/course/calendar',
        COURSE_MATERIAL_LESSON: '/course/:courseId/chapter/:chapterId/lesson/:lessonId',
        COURSE_MATERIAL: '/course/material/create',
        COURSE_MATERIAL_CHAPTER: '/course/:courseId/chapter/:chapterId',
        COURSE_MATERIAL_EDIT: '/course/material/:materialTitleId/edit',
        COURSE_MATERIAL_CHAPTER_EDIT: '/course/material/:materialTitleId/chapter/:chapterId/edit',
        COURSE_MATERIAL_LESSON_EDIT: '/course/material/:materialTitleId/lesson/:lessonId/edit',
        COURSE_MATERIAL_TOPIC_EDIT: '/course/material/:materialTitleId/topic/:topicId/edit',
        COURSE_MATERIAL_SUB_TOPIC_EDIT: '/course/material/:materialTitleId/subTopic/:subTopicId/edit',
        COURSE_MATERIAL_VIEW: '/course/material/:materialTitleId/list',
        COURSE_MATERIAL_TITLE_LIST: '/course/material/list',
        COURSE_PAYMENT : '/course/student/:courseId/coursePayment',
        MY_COURSE_DETAILS:'/course/mycourse/:courseId/coursedetails',
        COURSE_REQUEST: '/course/mycourse/courseRequests',
        STUDENT_COURSE_REQUEST_VIEW :'/course/myrequest/:courseRequestId/courseRequestdetails',
        MY_COURSE_PAYMENT_SCHEDULE:'/course/mycourse/:courseId/coursePaymentSchedule',
        COURSE_LIST_STUDENT:'/course/:courseId/student/list',
        COURSE_LIST_STUDENT:'/course/:courseId/students',
        BATCH_LIST_STUDENT:'/course/:courseId/batch/:batchId/students',
        BATCH_EDIT_STUDENT:'/course/:batchstudentId/course/:courseId/batch/:batchId/student/:studentId',
        STUDENT_COUNSELLING_CHECKLIST:'/course/student/counselling/checklist',
        COURSE_PAYMENT_DETAIL: '/course/student/paymentDetail'
    },
    FILE_PATH: {
        COURSE_ADMIN: 'system/views/admin_layout.html',
        COURSE: 'system/views/admin_layout.html',

        ADMIN_COURSE_LIST: 'course/views/admin_course_list.html',
        ADMIN_COURSE_CREATE: 'course/views/admin_course_create.html',
        ADMIN_COURSE_EDIT: 'course/views/admin_course_edit.html',

        COURSE_LIST: 'course/views/user_course_list.html',
        COURSE_LIST_DETAILS: 'course/views/course_details.html',
        COURSE_TABS: 'course/views/course_tabs.html',
        COURSE_MY_COURSES: 'course/views/myCourses.html',
        COURSE_SELECTED: 'course/views/course_selected.html',
        COURSE_PAYMENT: 'course/views/course_payment.html',
        COURSE_FORM_CREATE: 'course/views/form_create.html',

        ADMIN_BATCH_CREATE: 'course/views/admin_batch_create.html',
        ADMIN_BATCH_LIST: 'course/views/admin_batch.html',
        ADMIN_BATCH_EDIT: 'course/views/admin_batch_edit.html',
        ADMIN_BATCH_VIEW: 'course/views/admin_batch_view.html',

        ADMIN_BATCH_ATTENDANCE: 'course/views/adminattendance.html',
        ADMIN_USER_COUNSELLING_LIST: 'course/views/admin_user_counselling.html',
        ADMIN_USER_COUNSELLING_EDIT: 'course/views/admin_user_counselling_edit.html',
        COURSE_TEST_REDIRECT: 'course/views/course_test_redirect.html',
        COURSE_CURRICULUM: 'course/views/course_curriculum.html',
        ADMIN_STUDENT_LIST: 'course/views/admin_student_list.html',
        STUDENT_METRICS: 'course/views/student_metrics.html',
        ADMIN_STUDENT_MANAGE: 'course/views/admin_student_manage.html',
        ADMIN_COURSE_LOAN: 'course/views/admin_course_loans.html',
        ADMIN_COURSE_LOAN_CREATE: 'course/views/admin_course_loans_create.html',
        COURSE_ONLINETEST: 'course/views/student_onlinetest.html',
        STUDENT_EDITPROFILE: 'course/views/student_edit_profile.html',
        COURSE_DISCOUNT: 'course/views/course_discount.html',
        MY_COURSE: 'course/views/mycourse.html',
        COURSE_COURSE_MATERIALS: 'course/views/coursematerials.html',
        COURSE_SCHEDULE: 'course/views/schedule.html',
        COURSE_MENTOR: 'course/views/mentor.html',
        COURSE_BATCH_MATES: 'course/views/batchmates.html',
        COURSE_TEST: 'course/views/test.html',
        MY_COURSE_CURRICULUM: 'course/views/curriculum.html',
        COUNSELLING_REQUEST: 'course/views/counselling_request.html',
        MY_COURSE_INVEST: 'course/views/investment_view.html',
        COURSE_INSTALLMENT_FORM: 'course/views/admin_course_installment.html',
        ADMIN_COURSE_CURRICULUM: 'course/views/admin_course_curriculum.html',
        ADMIN_COURSE_CURRICULUM_CREATE: 'course/views/admin_course_curriculum_create.html',
        ADMIN_COURSE_CURRICULUM_EDIT: 'course/views/admin_course_curriculum_edit.html',
        ADMIN_COURSE_CURRICULUM_SESSION: 'course/views/admin_course_curriculum_session.html',
        ADMIN_COURSE_CURRICULUM_SESSION_CREATE: 'course/views/admin_course_session_create.html',
        ADMIN_COURSE_CURRICULUM_SESSION_EDIT: 'course/views/admin_course_session_edit.html',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC: 'course/views/admin_course_curriculum_topic.html',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE: 'course/views/admin_course_topic_create.html',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT: 'course/views/admin_course_topic_edit.html',
        ADMIN_COURSE_MATERIAL: 'course/views/admin_course_material.html',
        ADMIN_COURSE_MATERIAL_CREATE: 'course/views/admin_course_material_create.html',
        ADMIN_COURSE_MATERIAL_EDIT: 'course/views/admin_course_material_edit.html',
        ADMIN_CURRICULUM_TOPICS :'curriculum/views/coursecurriculum.html',
        ADMIN_COURSE_BRANCH_ASSIGNMENT: '/course/views/admin_course_branch_assignment.html',
        ADMIN_COURSE_PAYMENT_SCHEME: '/course/views/admin_course_payment_scheme.html',


        ADMIN_HOLIDAY_CREATE: 'course/views/admin_holiday_create.html',
        ADMIN_HOLIDAY_LIST: 'course/views/admin_holiday_list.html',
        ADMIN_HOLIDAY_EDIT: 'course/views/admin_holiday_edit.html',

        ADMIN_FRANCHISE_CREATE:'course/views/admin_franchise_create.html',
        ADMIN_FRANCHISE_LIST: 'course/views/admin_franchise_list.html',
        ADMIN_FRANCHISE_EDIT: 'course/views/admin_franchise_edit.html',
        ADMIN_FRANCHISE_VIEW: 'course/views/admin_franchise_view.html',

        COURSE_PROJECT_LIST: 'course/views/course_project_list.html',
        COURSE_PROJECT_CREATE: 'course/views/course_project_create.html',
        COURSE_PROJECT_EDIT: 'course/views/course_project_edit.html',
        COURSE_PROJECT_DETAILS: 'course/views/course_project_details.html',

        STUDENT_COUNSELLING_REQUEST: 'course/views/student_counselling_request.html',
        STUDENT_COUNSELLING_REQUEST_STATUS: 'course/views/student_counselling_request_status.html',
        MENTOR_ASSIGNMENT: 'course/views/mentor_assignment.html',
        ADMIN_COURSE_REQUEST:  'course/views/admin_course_request.html',
        COURSE_REQUEST_VIEW: 'course/views/course_request_view.html',
        STUDENT_DETAILS:'course/views/student_details.html',
        COURSE_DETAILS : 'course/views/courseDetails.html',
        CALENDAR : 'course/views/calendar.html',
        COURSE_MATERIAL_LESSON: 'course/views/course_material_lesson.html',
        COURSE_MATERIAL: 'course/views/course_material_create.html',
        COURSE_MATERIAL_CHAPTER: 'course/views/course_material_chapter.html',
        COURSE_MATERIAL_EDIT: 'course/views/course_material_update.html',
        COURSE_MATERIAL_CHAPTER_EDIT: 'course/views/course_material_update.html',
        COURSE_MATERIAL_LESSON_EDIT: 'course/views/course_material_update.html',
        COURSE_MATERIAL_TOPIC_EDIT: 'course/views/course_material_update.html',
        COURSE_MATERIAL_SUB_TOPIC_EDIT: 'course/views/course_material_update.html',
        COURSE_MATERIAL_VIEW: 'course/views/course_material_view.html',
        COURSE_MATERIAL_TITLE_LIST: 'course/views/course_material_title_list.html',
        ADMIN_COUNSELLING_CREATE_SCHEDULE: 'course/views/admin_counselling_schedule.html',
        COURSE_PAYMENT : 'course/views/coursePayment.html',
        MY_COURSE_DETAILS:'course/views/mycourseDetails.html',
        COURSE_REQUEST: 'course/views/studentCourseRequests.html',
        STUDENT_COURSE_REQUEST_VIEW:'course/views/student_course_request_view.html',
        MY_COURSE_PAYMENT_SCHEDULE:'course/views/mycourseSchedule.html',
        COUNSELLING_CHECKLIST_CREATE:'course/views/counselling_checklist_create.html',
        COUNSELLING_CHECKLIST_EDIT:'course/views/counselling_checklist_edit.html',
        COUNSELLING_CHECKLIST:'course/views/counselling_checklist.html',
        ADMIN_USER_COUNSELLING_REQUEST_LIST : 'course/views/adminusercounsellinglist.html',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL : 'course/views/adminusercounsellingeditdetail.html',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL : 'course/views/adminusercounsellingviewdetail.html',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST : 'course/views/adminusercounsellingschedulecompleviewdetail.html',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT : 'course/views/adminusercounsellingschedulecompleteeditdetail.html',
        ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW : 'course/views/mentorschedulelistview.html',
        ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW : 'course/views/mentorscheduledetailpage.html',
        ADMIN_COURSE_BRANCH_VIEW:'course/views/admin_course_branch_view.html',
        COURSE_LIST_STUDENT:'course/views/course_student_list.html',
        COUNSELLING_CHECKLIST_VIEW:'course/views/counselling_checklist_view.html',
        BATCH_LIST_STUDENT:'course/views/batch_student_list.html',
        BATCH_EDIT_STUDENT:'course/views/batch_student_edit.html',
        STUDENT_COUNSELLING_CHECKLIST:'course/views/student_counselling_checklist.html',
        COURSE_PAYMENT_DETAIL: 'course/views/coursePaymentDetail.html'
    },

    STATE: {
        COURSE_ADMIN: 'course_admin',

        ADMIN_COURSE_LIST: 'course_admin.course',
        ADMIN_COURSE_CREATE: 'course_admin.course_create',
        ADMIN_COURSE_EDIT: 'course_admin.course_edit',

        ADMIN_BATCH_CREATE: 'course_admin.batch_create',
        ADMIN_BATCH_LIST: 'course_admin.batch_list',
        ADMIN_BATCH_EDIT: 'course_admin.batch_edit',
        ADMIN_BATCH_VIEW: 'course_admin.batch_view',

        ADMIN_BATCH_ATTENDANCE: 'course_admin.batch_attendance',
        ADMIN_USER_COUNSELLING_LIST: 'course_admin.user_counselling_list',
        ADMIN_USER_COUNSELLING_EDIT: 'course_admin.user_counselling_edit',
        ADMIN_STUDENT_LIST: 'course_admin.student_list',
        STUDENT_METRICS: 'course_admin.student_metrics',
        ADMIN_STUDENT_MANAGE: 'course_admin.student_manage',
        ADMIN_COURSE_CURRICULUM: 'course_admin.course_curriculum',
        ADMIN_COURSE_CURRICULUM_CREATE: 'course_admin.course_curriculum_create',
        ADMIN_COURSE_CURRICULUM_EDIT: 'course_admin.course_curriculum_edit',
        ADMIN_COURSE_CURRICULUM_SESSION: 'course_admin.course_curriculum_session',
        ADMIN_COURSE_CURRICULUM_SESSION_CREATE: 'course_admin.course_curriculum_session_create',
        ADMIN_COURSE_CURRICULUM_SESSION_EDIT: 'course_admin.curriculum_session_edit',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC: 'course_admin.curriculum_session_topic',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE: 'course_admin.curriculum_session_topic_create',
        ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT: 'course_admin.curriculum_session_topic_edit',
        ADMIN_COURSE_MATERIAL: 'course_admin.course_material',
        ADMIN_COURSE_MATERIAL_CREATE: 'course_admin.course_material_create',
        ADMIN_COURSE_MATERIAL_EDIT: 'course_admin.course_material_edit',
        ADMIN_HOLIDAY_CREATE: 'course_admin.holiday_create',
        ADMIN_HOLIDAY_LIST: 'course_admin.holiday',
        ADMIN_HOLIDAY_EDIT: 'course_admin.holiday_edit',
        ADMIN_CURRICULUM_TOPICS:'course_admin.course_topic',

        ADMIN_FRANCHISE_CREATE: 'course_admin.franchise_create',
        ADMIN_FRANCHISE_LIST: 'course_admin.franchise',
        ADMIN_FRANCHISE_EDIT: 'course_admin.franchise_edit',
        ADMIN_FRANCHISE_VIEW: 'course_admin.franchise_details',



        COURSE_PROJECT_LIST: 'course_admin.courseproject',
        COURSE_PROJECT_CREATE: 'course_admin.courseproject_create',
        COURSE_PROJECT_EDIT: 'course_admin.courseproject_edit',
        COURSE_PROJECT_DETAILS: 'course_admin.courseproject_details',

        ADMIN_COURSE_BRANCH_ASSIGNMENT: 'course_admin.course-branch_assignment',
        ADMIN_COURSE_PAYMENT_SCHEME: 'course_admin.course_branchassignment',
        ADMIN_USER_COUNSELLING_REQUEST_LIST : 'course_admin.counselling_list',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL : 'course_admin.counselling_scheduleReq_edit',
        ADMIN_USER_COUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL : 'course_admin.counselling_scheduleReq_viewDetail',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST : 'course_admin.counselling_create',
        ADMIN_USER_COUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT : 'course_admin.counselling_create_list',
        ADMIN_USER_COUNSELLING_MENTOR_LIST_VIEW : 'course_admin.counselling_mentor_schedulelist',
        ADMIN_USER_COUNSELLING_MENTOR_DETAIL_VIEW : 'course_admin.counselling_mentor_scheduledetail',
        ADMIN_COURSE_REQUEST: 'course_admin.CourseRequest',
        ADMIN_COURSE_LOAN: 'course_admin.course_loans',
        ADMIN_COURSE_LOAN_CREATE: 'course_admin.course_loans_create',
        ADMIN_COUNSELLING_CREATE_SCHEDULE: '/counsellingCreate',
        COUNSELLING_CHECKLIST_CREATE:'course_admin.counselling_checklist_create',
        COUNSELLING_CHECKLIST_EDIT:'course_admin.counselling_checklist_edit',
        COUNSELLING_CHECKLIST:'course_admin.counselling_checklist',
        ADMIN_COURSE_BRANCH_VIEW:'course_admin.branch_payment-scheme_view',
        COUNSELLING_CHECKLIST_VIEW:'course_admin.counselling_checklist_view',


        COURSE: 'course',
        COURSE_LIST: 'course.courseList',
        COURSE_LIST_DETAILS: 'course.courselist_Details',
        COURSE_TABS: 'course.courseTabs',
        COURSE_MY_COURSES: 'course.myCourses',
        COURSE_SELECTED: 'course.course_selected',
        COURSE_PAYMENT: 'course.payment',
        COURSE_FORM_CREATE: 'course.form_create',
        COURSE_TEST_REDIRECT: 'course.test_redirect',
        COURSE_CURRICULUM: 'course.curriculum',
        COURSE_ONLINETEST: 'course.student_onlinetest',
        STUDENT_EDITPROFILE: 'course.student_editProfile',
        COURSE_DISCOUNT: 'course.discount',
        MY_COURSE: 'course.mycourse',
        COURSE_COURSE_MATERIALS: 'course.course_materials',
        COURSE_SCHEDULE: 'course.schedule',
        COURSE_MENTOR: 'course.mentor',
        COURSE_BATCH_MATES: 'course.batchmates',
        COURSE_TEST: 'course.test',
        MY_COURSE_CURRICULUM: 'course.mycourse_curriculum',
        COUNSELLING_REQUEST: 'course.request',
        MY_COURSE_INVEST: 'course.invest',
        COURSE_INSTALLMENT_FORM: 'course.course-management',
        STUDENT_COUNSELLING_REQUEST: 'course.counsellingRequest',
        STUDENT_COUNSELLING_REQUEST_STATUS: 'course.counsellingStatus',
        PAYMENT_SCHEDULE:'course.paymentschedule',
        MENTOR_ASSIGNMENT: 'course.mentorassignment',
        COURSE_REQUEST_VIEW: 'course.courseRequest_details',
        STUDENT_DETAILS:'course.studentdetails',
        COURSE_DETAILS : 'course.courseDetails',
        CALENDAR : 'course.calendar',
        COURSE_MATERIAL_LESSON: 'course.chapter_lesson',
        COURSE_MATERIAL: 'course.material_create',
        COURSE_MATERIAL_CHAPTER: 'course.chapter',
        COURSE_MATERIAL_EDIT: 'course.materialTitleId_edit',
        COURSE_MATERIAL_CHAPTER_EDIT: 'course.material_chapter_edit',
        COURSE_MATERIAL_LESSON_EDIT: 'course.material_lesson_edit',
        COURSE_MATERIAL_TOPIC_EDIT: 'course.material_topic',
        COURSE_MATERIAL_SUB_TOPIC_EDIT: 'course.material_subTopic_edit',
        COURSE_MATERIAL_VIEW: 'course.material_list_view',
        COURSE_MATERIAL_TITLE_LIST: 'course.material_list',
        COURSE_STUDENT_PAYMENT : 'course.student_coursePayment',
        MY_COURSE_DETAILS:'course.mycourse_coursedetails',
        COURSE_REQUEST: 'course.mycourse_courseRequests',
        STUDENT_COURSE_REQUEST_VIEW :'course.myrequest_courseRequestdetails',
        MY_COURSE_PAYMENT_SCHEDULE:'course.mycourse_coursePaymentSchedule',
        COURSE_LIST_STUDENT:'course.student_list',
        COURSE_LIST_STUDENT:'course.students',
        BATCH_LIST_STUDENT:'course.batch_students',
        BATCH_EDIT_STUDENT:'course.batch_student_detail',
        STUDENT_COUNSELLING_CHECKLIST:'course.student_counselling_checklist',
        COURSE_PAYMENT_DETAIL: 'course.student_payment_detail'
    }
});