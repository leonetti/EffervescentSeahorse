(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventsCtrl', EventsCtrl);

    EventsCtrl.$inject = ['$scope', '$state', '$timeout'];

    function EventsCtrl ($scope, $state, $timeout) {
      var vm = this;
      console.log('initialized EventsController');
      vm.events = [];
      ref.child('events').on('value', function(snapshot) {
        $timeout(function() {
          for (var id in snapshot.val()) {
              vm.events.push(snapshot.val()[id]);
          }
        });
      });
    };
})();
