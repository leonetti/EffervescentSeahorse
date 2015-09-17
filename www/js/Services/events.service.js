(function() {
  'use strict';
  angular.module('starter.services').factory('eventsService', eventsService);

  eventsService.$inject = ['userService', '$stateParams'];
  function eventsService(userService, $stateParams) {
    function getEventId() {
      return $stateParams.eventId;
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

    function getAttendees(attendees) {
      return new Promise(function(resolve, reject) {
        var attendeeList = [];
        for (var id in attendees) {
          if (attendees.hasOwnProperty(id)) {
            var attendeeId = attendees[id];
            userService.getCompleteUser(attendeeId).then(function(attendee) {
              attendeeList.push(attendee);
              if (attendeeList.length === Object.keys(attendees).length) {
                resolve(attendeeList);
              }
            });
          }
        }
      });
    }

    function joinEvent() {
      var userId = userService.getCurrentUserId();
      var eventId = getEventId();
      userService.get('attendees', eventId).then(function(attendees) {
        for (var id in attendees) {
          if (attendees[id] === userId) {
            return;
          }
        }
        ref.child('attendees').child(eventId).push(userId);

        // decrement the number of people required for that event
        ref.child('events').child(eventId).once('value', function(snapshot) {
          var numPepes = snapshot.val().numPeople - 1;
          ref.child('events').child(eventId).update({numPeople: numPepes});
        });
      });
    }

    function leaveEvent() {
      var userId = userService.getCurrentUserId();
      var eventId = getEventId();
      userService.get('attendees', eventId).then(function(attendees) {
        for (var id in attendees) {
          if (attendees.hasOwnProperty(id)) {
            if (attendees[id] === userId) {
              ref.child('attendees').child(eventId).child(id).remove();

              // increment numPeople
              ref.child('events').child(eventId).once('value', function(snapshot) {
                var numPepes = snapshot.val().numPeople + 1;
                ref.child('events').child(eventId).update({numPeople: numPepes});
              });
            }
          }
        }
      });
    }

    return {
      'getEvent': getEvent,
      'getEventId': getEventId,
      'getAttendees': getAttendees,
      'joinEvent': joinEvent,
      'leaveEvent': leaveEvent
    };
  }
})();
