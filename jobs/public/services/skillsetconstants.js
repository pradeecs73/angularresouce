angular.module('mean.jobs').constant('SKILLSET',{
    URL_PATH:{
     SKILLSETCREATE: '/skillset',
     SKILLSETLIST: '/skillsetlist',
     SKILLSETEDIT: '/skillset/:skillsetId/edit'        
    },
    FILE_PATH: {
     SKILLSETCREATE: 'jobs/views/skillsetcreate.html',
     SKILLSETLIST: 'jobs/views/skillsetlist.html',
     SKILLSETEDIT: 'jobs/views/skillsetedit.html'
    },
    STATE: {
     SKILLSETCREATE: 'skill set create page',
     SKILLSETLIST: 'skill set list page',
     SKILLSETEDIT: 'skill set edit page'
    }
});

