angular.module('mean.branch').constant('BRANCH',{
    URL_PATH:{
        LISTCOUNTRY: '/admin/country',
        CREATECOUNTRY: '/admin/country/create',
        EDITCOUNTRY :'/admin/country/:countryId/edit',
        SHOWCOUNTRY: '/admin/country/:countryId/show',
        LISTZONE: '/admin/country/:countryId/zone',
        CREATEZONE: '/admin/country/:countryId/zone/create',
        EDITZONE :'/admin/zone/:zoneId/edit',
        LISTCITY: '/admin/zone/:zoneId/city',
        CREATECITY: '/admin/zone/:zoneId/city/create',
        EDITCITY :'/admin/city/:cityId/edit',
        LISTBRANCH: '/admin/city/:cityId/branch',
        CREATEBRANCH:  '/admin/city/:cityId/branch/create',
        EDITBRANCH :'/admin/branch/:branchId/edit'
        
        
    },
    FILE_PATH: {
    	 LISTCOUNTRY: 'branch/views/country_list.html',
         CREATECOUNTRY: 'branch/views/country_create.html',
         EDITCOUNTRY :'branch/views/country_edit.html',
         SHOWCOUNTRY: '/admin/country/:countryId/show',
         LISTZONE: 'branch/views/zone_list.html',
         CREATEZONE: 'branch/views/zone_create.html',
         EDITZONE :'branch/views/zone_edit.html',
         LISTCITY: 'branch/views/city_list.html',
         CREATECITY: 'branch/views/city_create.html',
         EDITCITY:'branch/views/city_edit.html',
         LISTBRANCH: 'branch/views/branch_list.html',
         CREATEBRANCH: 'branch/views/branch_create.html',
         EDITBRANCH:'branch/views/branch_edit.html'
             
        
    },
    STATE: {
    	 LISTCOUNTRY: 'country list page',
         CREATECOUNTRY: 'country create page',
         EDITCOUNTRY :'country edit page',
         SHOWCOUNTRY: 'country sh powage',
         LISTZONE: 'zone list page',
         CREATEZONE: 'zone create page',
         EDITZONE :'zone edit page',
         LISTCITY: 'city list page',
         CREATECITY: 'city create page',
         EDITCITY :'city edit page',
         LISTBRANCH: 'branch list page',
         CREATEBRANCH: 'branch create page',
         EDITBRANCH :'branch edit page',
        
       
    }
});


  