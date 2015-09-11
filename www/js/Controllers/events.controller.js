(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventsCtrl', EventsCtrl);

    EventsCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams'];

    function EventsCtrl ($scope, $state, $timeout, $stateParams) {
      var vm = this;
      console.log('initialized EventsController');
      $scope.$on('$ionicView.enter', function(e) {
        vm.events = [];
        ref.child('events').on('value', function(snapshot) {
          snapshot.forEach(function(child) {
            var eventId = child.key();
            ref.child('events').child(eventId).once('value', function(snapshot) {
              var uniqEvent = snapshot.val();
              uniqEvent.eventId = eventId;
              $timeout(function() {
                vm.events.push(uniqEvent);
              });
            });
          });
        });
      });
    };
})();
