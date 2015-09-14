(function() {
  'use strict';
  angular.module('starter.services').factory('eventsService', eventsService);

  eventsService.$inject = ['userService', '$stateParams'];
  function eventsService(userService, $stateParams) {
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

    // function getAttendees() {
    //   // get list of people at an event
    //   userService.get('attendees', )
    // }

    return {
      'getEvent': getEvent,
      'getEventId': getEventId
    };
  }
})();