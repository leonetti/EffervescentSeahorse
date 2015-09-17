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

    function acceptFriend(friendId) {
      var userId = userService.getCurrentUserId();

      // if the friend is already in user's friendlist, do not add again
      ref.child('friends').child(userId).once('value', function(snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === friendId) {
            return;
          }
        }
        ref.child('friends').child(userId).push(friendId);
        ref.child('friends').child(friendId).push(userId);
      });

      rejectFriend(friendId);
    }

    function rejectFriend(friendId) {
      var userId = userService.getCurrentUserId();

      ref.child('friendRequests').child(userId).once('value', function(snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === friendId) {
            ref.child('friendRequests').child(userId).child(id).remove();
          }
        }
      });
    }

    return {
      'getFriends': getFriends,
      'getFriendRequests': getFriendRequests,
      'acceptFriend': acceptFriend,
      'rejectFriend': rejectFriend
    };
  }
})();