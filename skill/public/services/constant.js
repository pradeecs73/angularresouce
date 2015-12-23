angular.module('mean.skill').constant('SKILL', {
	URL_PATH:{
	   SKILLLIST:'/skill',
	   SKILLCREATE:'/skill/create',
	   SKILLEDIT:'/skill/:skillId/edit',
	   BADGELIST:'/badges',
	   BADGECREATE:'/badge/create',
	   BADGEEDIT:'/badge/:badgeId/edit'
	   
	},
	FILE_PATH:{
		   SKILLLIST:'skill/views/skill_list.html',
		   SKILLCREATE:'skill/views/skill_create.html',
		   SKILLEDIT:'skill/views/skill_edit.html',
		   BADGELIST:'/skill/views/badge_list.html',
		   BADGECREATE:'/skill/views/badge_create.html',
		   BADGEEDIT:'/skill/views/badge_edit.html'
	},
	STATE:{
		SKILLLIST:'skill list',		   
		SKILLCREATE:'skill create',
		SKILLEDIT:'skill edit',
		BADGELIST:'badge list',
		BADGECREATE:'badge create',
		BADGEEDIT:'badge edit'
	}
});
