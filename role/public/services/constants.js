angular.module('mean.role').constant('ROLE',{
    URL_PATH:{
        LISTROLE: '/admin/role',
        CREATEROLE: '/admin/role/create',
        EDITROLE :'/admin/role/:roleId/edit',
        SHOWROLE: '/admin/role/:roleId/view',
        ROLEPERMISSION: '/admin/role/role-permission-allocation',
        
        LISTFEATUREROLE: '/admin/featurerole',
        CREATEFEATUREROLE: '/admin/featurerole/create',
        EDITFEATUREROLE :'/admin/featurerole/:roleId/edit',
        SHOWFEATUREROLE:'/admin/featurerole/:featureroleId/view',
        
        LISTFEATURE: '/admin/feature',
        CREATEFEATURE: '/admin/feature/create',
        EDITFEATURE :'/admin/feature/:featureId/edit',
        SHOWFEATURE:'/admin/feature/:featureId/view',
        
        FEATURECATEGORYLIST:'/admin/featurecategory',
        FEATURECATEGORYCREATE:'/admin/featurecategory/create',
        FEATURECATEGORYEDIT:'/admin/featurecategory/:featurecategoryId/edit',
        FEATURECATEGORYDETAILS:'/admin/featurecategory/:featurecategoryId/details'
        
    },
    FILE_PATH: {
    	 LISTROLE: 'role/views/role_list.html',
         CREATEROLE: 'role/views/role_create.html',
         EDITROLE :'role/views/role_edit.html',
         SHOWROLE: 'role/views/role_view.html',
         ROLEPERMISSION: 'role/views/role_permission_allocation.html',
         
         LISTFEATUREROLE: 'role/views/featurerole_list.html',
         CRAETEFEATUREROLE: 'featurerole/views/featurerole_create.html',
         EDITFEATUREROLE :'featurerole/views/featurerole_edit.html',
         SHOWFEATUREROLE:'featurerole/views/featurerole_view.html',
        	 
         LISTFEATURE: 'role/views/feature_list.html',
         CREATEFEATURE: 'role/views/feature_create.html',
         EDITFEATURE :'role/views/feature_edit.html',
         SHOWFEATURE: 'role/views/feature_view.html',
         
         FEATURECATEGORYLIST:'role/views/featurecategory_list.html',
         FEATURECATEGORYCREATE:'role/views/featurecategory_create.html',
         FEATURECATEGORYEDIT:'role/views/featurecategory_edit.html',
         FEATURECATEGORYDETAILS:'role/views/featurecategory_details.html'
        
    },
    STATE: {
    	 LISTROLE: 'role list page',
         CREATEROLE: 'role create page',
         EDITROLE :'role edit page',
         SHOWROLE: 'role sh powage',
         ROLEPERMISSION: 'role permission page',
         
         LISTFEATUREROLE: 'role-feature list page',
         CRAETEFEATUREROLE :'role-feature create page',
         EDITFEATUREROLE: 'role-feature edit page',
         SHOWFEATUREROLE: 'role-feature show page',
         
         LISTFEATURE: 'feature list page',
         CREATEFEATURE: 'feature create page',
         EDITFEATURE :'feature edit page',
         SHOWFEATURE:'feature show page',
         
         FEATURECATEGORYLIST:'featurecategory list',
         FEATURECATEGORYCREATE:'featurecategory create',	 
         FEATURECATEGORYEDIT:'featurecategory edit',
         FEATURECATEGORYDETAILS:'featurecategory details'
    }
});


  