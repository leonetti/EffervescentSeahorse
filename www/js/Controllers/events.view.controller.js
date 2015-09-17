(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventViewCtrl', EventViewCtrl);

    EventViewCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams', 'userService', 'eventsService', '$ionicLoading', '$ionicScrollDelegate'];

    function EventViewCtrl ($scope, $state, $timeout, $stateParams, userService, eventsService, $ionicLoading ,$ionicScrollDelegate) {
      var vm = this;
      console.log('initialized EventViewController');
      var eventId = $stateParams.eventId;
      vm.eventId = $stateParams.eventId;
      var userId = window.localStorage['uid'];
      vm.attendees = [];

      $ionicScrollDelegate.scrollTop();

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
          $ionicScrollDelegate.scrollTop();
        });

        // get users who are attending the event
        ref.child('attendees').child(eventId).on('value', function(snapshot) {
          eventsService.getAttendees(snapshot.val()).then(function(attendees) {
            $timeout(function() {
              vm.attendees = attendees;
            });
          });
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
              attendee.pic = userService.getDefaultPicture();
              ref.child('profilepicture').child(attendeeId).once('value', function(snapshot) {
                if (snapshot.val()) {
                  attendee.pic = snapshot.val().profilepicture || userService.getDefaultPicture();
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
              attendee.name = snapshot.val().displayName;
              ref.child('interests').child(attendeeId).once('value', function(snapshot) {
                attendee.interests = snapshot.val();
              });
            });
          });
        });
      });

      vm.joinEvent = function() {
        eventsService.joinEvent();

        $timeout(function() {
          vm.joined = true;
        });
      };

      vm.unjoinEvent = function() {
        eventsService.leaveEvent();

        $timeout(function() {
          vm.joined = false;
        });
      };
    };
})();
