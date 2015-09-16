(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventViewCtrl', EventViewCtrl);

    EventViewCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams'];

    function EventViewCtrl ($scope, $state, $timeout, $stateParams) {
      var vm = this;
      console.log('initialized EventViewController');
      var eventId = $stateParams.eventId;
      vm.eventId = $stateParams.eventId;
      var userId = window.localStorage['uid'];

      $scope.$on('$ionicView.enter', function(e) {
        ref.child('events').child(eventId).on('value', function(snapshot) {
          vm.description = snapshot.val().description;
          vm.eventDate = snapshot.val().eventDate;
          vm.location = snapshot.val().location;
          vm.numPeople = snapshot.val().numPeople;
          vm.activities = snapshot.val().activities;
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

        // show the list of people going to the event
        ref.child('attendees').child(eventId).on('value', function(snapshot) {
          vm.attendees = [];
          var included = false;
          snapshot.forEach(function(child) {
            var attendeeId = child.val();
            ref.child('users').child(attendeeId).once('value', function(snapshot) {
              var attendee = snapshot.val();
              attendee.id = attendeeId;
              if(attendee.id === window.localStorage.uid) {
                attendee.me = true;
              } else {
                attendee.me = false;
              }
              attendee.name = snapshot.val().displayName;
              ref.child('interests').child(attendeeId).once('value', function(snapshot) {
                attendee.interests = snapshot.val();
                ref.child('profilepicture').child(attendeeId).once('value', function(snapshot) {
                  if (snapshot.val()) {
                    attendee.pic = snapshot.val().profilepicture;
                  }
                  $timeout(function() {
                    for (var i = 0; i < vm.attendees.length; i++) {
                      if (vm.attendees[i].id === attendeeId) {
                        included = true;
                      }
                    }
                    if(!included) {
                      vm.attendees.push(attendee);
                    }
                  });
                });
              });
            });
          });
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

          $timeout(function() {
            // used to toggle join/unjoin button
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

              $timeout(function() {
                // toggle join/unjoin button
                vm.joined = false;
              });
            }
          }
        });
      };
    };
})();
