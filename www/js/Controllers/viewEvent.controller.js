(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventViewCtrl', EventViewCtrl);

    EventViewCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams'];

    function EventViewCtrl ($scope, $state, $timeout, $stateParams) {
      var vm = this;
      console.log('initialized EventViewController');
      var eventId = $stateParams.eventId;
      ref.child('events').child(eventId).once('value', function(snapshot) {
        vm.description = snapshot.val().description;
        vm.eventDate = snapshot.val().eventDate;
        vm.location = snapshot.val().location;
        vm.numPeople = snapshot.val().numPeople;
      });
    };
})();
