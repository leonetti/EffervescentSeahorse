(function() {
	'use strict';
	angular.module('starter.controllers')
	  .controller('SettingsController', SettingsController);

	SettingsController.$inject = ['$scope', '$ionicHistory', '$state'];

	function SettingsController ($scope, $ionicHistory, $state) {
		var vm = this;
		vm.logout = logout;
		vm.userID = window.localStorage.uid;
		console.log('initialized settings controller');

		function logout () {
			delete window.localStorage['uid'];
			ref.unauth();
			$ionicHistory.clearCache().then(function() {
				console.log('cleared views');
			});
			$state.go('login');
		}
	}
})();
