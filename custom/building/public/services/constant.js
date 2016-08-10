/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <constants: for company list,edit, add page>
 */

angular.module('mean.building').constant('BUILDING', {
    PATH: {
    	BUILDING_ADD: '/buildings/add',
    	BUILDING_EDIT: '/buildings/:buildingId/edit',
    	BUILDING_LIST: '/buildings'
    },
    FILE_PATH: {
    	BUILDING_ADD: 'building/views/building-add.html',
    	BUILDING_EDIT: 'building/views/building-edit.html',
    	BUILDING_LIST: 'building/views/building-list.html'
    },
    STATE: {
    	BUILDING_ADD: 'Buildings_create building',
    	BUILDING_EDIT: 'Buildings_update building',
    	BUILDING_LIST: 'Buildings_all buildings'
    }
});