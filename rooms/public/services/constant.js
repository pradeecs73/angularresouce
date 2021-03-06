angular.module('mean.users').constant('ROOMS', {
    URL_PATH: {
        ROOM_LIST: '/space/room/list',
        ROOM_EDIT: '/space/:roomId/edit',
        PACKAGE_EDIT: '/virtualOffice/:virtualOfficeId/package/:packageId/edit',
        ADMIN_ROOM_LIST: '/space/admin/room/list',
        ADMIN_ROOM_LIST_VIEW: '/space/admin/room/detailpage',
        ADMIN_SPACE_LIST_VIEW:'/admin/space/:spaceId/detailpage'
    },
    FILE_PATH: {
        ROOM_LIST: 'rooms/views/roomslist.html',
        ROOM_EDIT: 'rooms/views/roomedit.html',
        PACKAGE_EDIT: '/rooms/views/packageEdit.html',
        ADMIN_ROOM_LIST: 'rooms/views/adminroomlist.html',
        ADMIN_ROOM_LIST_VIEW: 'rooms/views/adminroomdetailview.html',
        ADMIN_SPACE_LIST_VIEW:'rooms/views/adminspacedetailview.html'
    },
    STATE: {
        ROOM_LIST: 'rooms',
        ROOM_EDIT: 'rooms edit',
        PACKAGE_EDIT: 'package edit',
        ADMIN_ROOM_LIST: 'admin rooms',
        ADMIN_ROOM_LIST_VIEW: 'admin rooms view',
        ADMIN_SPACE_LIST_VIEW:'admin space view'
    
    }
});