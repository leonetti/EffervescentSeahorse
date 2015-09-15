(function() {
  'use strict';
  angular.module('starter.services').factory('eventsService', eventsService);

  eventsService.$inject = ['userService', '$stateParams', '$timeout'];
  function eventsService(userService, $stateParams, $timeout) {
    function getEventId() {
      return new Promise(function(resolve, reject) {
        resolve($stateParams.eventId);
      });
    }

    function getEvent() {
      return new Promise(function(resolve, reject) {
        ref.child('events').on('value', function(snapshot) {
          var events = [];
          snapshot.forEach(function(child) {
            var eventId = child.key();
            userService.get('events', eventId).then(function(uniqEvent) {
              uniqEvent.eventId = eventId;
              events.push(uniqEvent);
            });
          });
          resolve(events);
        });
      });
    }

    function getAttendees() {
      return new Promise(function(resolve, reject) {
        getEventId().then(function(eventId) {
          var attendeeList = [];
          userService.get('attendees', eventId).then(function(attendees) {
            for (var pushId in attendees) {
              var attendeeId = attendees[pushId];
              userService.getCompleteUser(attendeeId).then(function(user) {
                $timeout(function() {
                  attendeeList.push(user);
                });
              });
            }
          });
          resolve(attendeeList);
        });
      });
    }

    // function joinEvent() {
    //   getEventId().then(function(eventId) {

    //   });
    // }

    return {
      'getEvent': getEvent,
      'getEventId': getEventId,
      'getAttendees': getAttendees
    };
  }
})();
