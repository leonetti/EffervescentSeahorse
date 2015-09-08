(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('CreateEventsCtrl', CreateEventsCtrl);

    CreateEventsCtrl.$inject = ['$scope', '$state'];

    function CreateEventsCtrl ($scope, $state) {
      var vm = this;
      console.log('initialized CreateEventsController');
    };
})();
