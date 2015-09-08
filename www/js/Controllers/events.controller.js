(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventsCtrl', EventsCtrl);

    EventsCtrl.$inject = ['$scope', '$state'];

    function EventsCtrl ($scope, $state) {
      var vm = this;
      console.log('initialized EventsController');
    };
})();
