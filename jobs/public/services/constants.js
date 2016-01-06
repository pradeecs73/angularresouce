angular.module('mean.jobs').constant('JOBS',{
    URL_PATH:{
        JOBSLIST: '/jobs',
        JOBDETAIL:'/job/:jobId/details',
        SITELIST:'/admin/site',
        SITECREATE:'/admin/site/create',
        SITEEDIT:'/admin/site/:siteId/edit',
        SITEDETAILS:'/admin/site/:siteId/details',
        
    },
    FILE_PATH: {
    	 JOBSLIST: 'jobs/views/jobstab.html',
    	 JOBDETAIL:'jobs/views/jobdetail.html',
    	 SITELIST:'jobs/views/site_list.html',
    	 SITECREATE:'jobs/views/site_create.html',    
         SITEEDIT:'/admin/site/:siteId/edit',
         SITEDETAILS: 'jobs/views/site_details.html'
    },
    STATE: {
    	 JOBSLIST: 'jobs List page',
    	 JOBDETAIL:'job detailed page',
    	 SITELIST:'site list',
    	 SITECREATE:'site create',
    	 SITEEDIT:'site edit',
    	 SITEDETAILS:'site details'
    	 
    }
});


  