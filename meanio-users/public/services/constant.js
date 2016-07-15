angular.module('mean.users').constant('USERS', {
    URL_PATH: {
        USER_CREATE: '/users/create',
        USER_LIST: '/users',
        USER_EDIT: '/users/:userId/edit',
        ROLE_CREATE: '/roles/create',
        ROLE_LIST: '/roles',
        ROLE_EDIT: '/roles/:roleId/edit',
        USER_BULUPLOAD: '/users/create/bulkupload'
    },
    FILE_PATH: {
        USER_CREATE: 'users/views/user_create.html',
        USER_LIST: 'users/views/user_list.html',
        USER_EDIT: 'users/views/user_edit.html',
        ROLE_CREATE: 'users/views/role_create.html',
        ROLE_LIST: 'users/views/role_list.html',
        ROLE_EDIT: 'users/views/role_edit.html',
        USER_BULUPLOAD: '/users/views/user_bulkupload.html'
    },
    STATE: {
        USER_CREATE: 'User_create user',
        USER_LIST: 'User_all users',
        USER_EDIT: 'User_edit user',
        ROLE_CREATE: 'Role_create role',
        ROLE_LIST: 'Role_all roles',
        ROLE_EDIT: 'Role_edit role',
        USER_BULUPLOAD: 'USER_BULUPLOAD users'
    }   
});