(function() {
	'use strict';
	angular.module('starter.controllers')
		.controller('SettingsController', SettingsController);

		SettingsController.$inject = ['$scope'];

		function SettingsController ($scope) {
			var vm = this;

			vm.userID = window.localStorage.uid;
		}
})();