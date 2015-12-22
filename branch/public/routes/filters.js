angular.module('mean.branch').config([ '$stateProvider', 
        function($stateProvider) {
			$stateProvider.state('location filter page', {
				url : '/admin/locationFilter',
				templateUrl : 'branch/views/locationFilter.html'
			})
			.state('role filter page', {
				url : '/admin/RoleFilter',
				templateUrl : 'branch/views/role_filter.html'
			});
			
		}
]);