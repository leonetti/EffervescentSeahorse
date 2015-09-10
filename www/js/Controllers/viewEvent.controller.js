(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventViewCtrl', EventViewCtrl);

    EventViewCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams'];

    function EventViewCtrl ($scope, $state, $timeout, $stateParams) {
      var vm = this;
      console.log('initialized EventViewController');
      var eventId = $stateParams.eventId;
      var userId = window.localStorage['uid'];
      $scope.$on('$ionicView.enter', function(e) {
        ref.child('events').child(eventId).on('value', function(snapshot) {
          vm.description = snapshot.val().description;
          vm.eventDate = snapshot.val().eventDate;
          vm.location = snapshot.val().location;
          vm.numPeople = snapshot.val().numPeople;
        });

        // check if the user has already joined this event; show unjoin if already joined
        ref.child('attendees').child(eventId).once('value', function(snapshot) {
          for (var id in snapshot.val()) {
            if (snapshot.val()[id] === userId) {
              $timeout(function() {
                vm.joined = true;
              });
            }
          }
        });
      });

      vm.joinEvent = function() {
        // add the user to the attendees list for that event
        // check to see if the user is already in the list of attendees
        ref.child('attendees').child(eventId).once('value', function(snapshot) {
          for (var id in snapshot.val()) {
            if (snapshot.val()[id] === userId) {
              return;
            }
          }
          ref.child('attendees').child(eventId).push(userId);

          // decrement the number of people required for that event
          ref.child('events').child(eventId).once('value', function(snapshot) {
            var numPepes = snapshot.val().numPeople - 1;
            ref.child('events').child(eventId).update({numPeople: numPepes});
          });

          // used to toggle join/unjoin button
          $timeout(function() {
            vm.joined = true;
          });
        });
      };

      vm.unjoinEvent = function() {
        // remove the user from the attendees list
        ref.child('attendees').child(eventId).once('value', function(snapshot) {
          for (var id in snapshot.val()) {
            if (snapshot.val()[id] === userId) {
              ref.child('attendees').child(eventId).child(id).remove();

              // increment numPeople
              ref.child('events').child(eventId).once('value', function(snapshot) {
                var numPepes = snapshot.val().numPeople + 1;
                ref.child('events').child(eventId).update({numPeople: numPepes});
              });

              // used to toggle join/unjoin button
              $timeout(function() {
                vm.joined = false;
              });
            }
          }
        });
      };
    };
})();
