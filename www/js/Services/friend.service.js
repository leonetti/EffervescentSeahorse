(function() {
  'use strict';
  angular.module('starter.services').factory('friendService', friendService);

  friendService.$inject = ['userService']

  function friendService(userService) {
    function getFriends(friends) {
      return new Promise(function(resolve, reject) {
        var friendsList = [];
        for (var id in friends) {
          if (friends.hasOwnProperty(id)) {
            var friendId = friends[id];
            userService.getCompleteUser(friendId).then(function(friend) {
              friendsList.push(friend);
              if (friendsList.length === Object.keys(friends).length) {
                resolve(friendsList);
              }
            });
          }
        }
      });
    }

    function getFriendRequests(requests) {
      return new Promise(function(resolve, reject) {
        var friendRequests = [];
        for (var id in requests) {
          if (requests.hasOwnProperty(id)) {
            var requestId = requests[id];
            userService.getCompleteUser(requestId).then(function(requester) {
              friendRequests.push(requester);
              if (friendRequests.length === Object.keys(requests).length) {
                resolve(friendRequests);
              }
            });
          }
        }
      });
    }

    return {
      'getFriends': getFriends,
      'getFriendRequests': getFriendRequests
    };
  }
})();