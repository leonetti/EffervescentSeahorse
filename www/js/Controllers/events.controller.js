(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventsCtrl', EventsCtrl);

    EventsCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams', 'eventsService'];

    function EventsCtrl ($scope, $state, $timeout, $stateParams, eventsService) {
      var vm = this;
      console.log('initialized EventsController');
      $scope.$on('$ionicView.enter', function(e) {
        vm.events = [];

        eventsService.getEvent().then(function(events) {
          $timeout(function() {
            vm.events = events;
          });
        });
      });
    };
})();
