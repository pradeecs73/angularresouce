
angular.module('mean.assets').constant('ASSETS', {
    PATH: {
        GUARDLIST: '/building/:buildingId/guards',
        GUARDCREATE: '/building/:buildingId/guard/add',
        GUARDEDIT:  '/building/:buildingId/guard/:guardId/edit',
        CAMERA_LIST: '/building/:buildingId/camera',
        CAMERA_ADD: '/building/:buildingId/camera/create',
        CAMERA_EDIT: '/building/:buildingId/camera/:cameraId/edit',
        BURGLARALARM_LIST: '/building/:buildingId/burglaralarm',
        BURGLARALARM_ADD: '/building/:buildingId/burglaralarm/create',
        BURGLARALARM_EDIT: '/building/:buildingId/burglaralarm/:burglarAlarmId/edit',
        ASSETS_ACCESSCONTROL_LIST: '/building/:buildingId/accesscontrol',
    	ASSETS_ACCESSCONTROL_CREATE: '/building/:buildingId/accesscontrol/add',
    	ASSETS_ACCESSCONTROL_EDIT: '/building/:buildingId/accesscontrol/:accesscontrolId/edit'
    },
    FILE_PATH: {
        GUARDLIST : 'assets/views/guard_list.html',
        GUARDCREATE: 'assets/views/guard_create.html',
        GUARDEDIT: 'assets/views/guard_edit.html',
        CAMERA_LIST: 'assets/views/camera-list.html',
        CAMERA_ADD: 'assets/views/camera-create.html',
        CAMERA_EDIT: 'assets/views/camera-edit.html',
        BURGLARALARM_LIST: 'assets/views/burglarAlarm-list.html',
        BURGLARALARM_ADD: 'assets/views/burglarAlarm-add.html',
        BURGLARALARM_EDIT: 'assets/views/burglarAlarm-edit.html',
        ASSETS_ACCESSCONTROL_LIST: 'assets/views/accesscontrollist.html',
    	ASSETS_ACCESSCONTROL_CREATE: 'assets/views/accesscontrolcreate.html',
    	ASSETS_ACCESSCONTROL_EDIT: 'assets/views/accesscontroledit.html'
    },
    STATE: {
        GUARDLIST:  'Assets_all guarding',
        GUARDCREATE: 'Assets_create guarding',
        GUARDEDIT: 'Assets_update guarding',
        CAMERA_LIST: 'Assets_all camera system',
        CAMERA_ADD: 'Assets_create camera system',
        CAMERA_EDIT: 'Assets_update camera system',
        BURGLARALARM_LIST: 'Assets_all burglar alarm',
        BURGLARALARM_ADD: 'Assets_create burglar alarm',
        BURGLARALARM_EDIT: 'Assets update burglar alarm',
        ASSETS_ACCESSCONTROL_LIST: 'Assets_all access control',
    	ASSETS_ACCESSCONTROL_CREATE: 'Assets_create access control',
    	ASSETS_ACCESSCONTROL_EDIT: 'Assets_edit access control'
    }
});