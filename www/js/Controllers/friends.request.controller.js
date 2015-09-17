(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('FriendsRequestController', FriendsRequestController);

  FriendsRequestController.$inject = ['$scope', '$timeout', 'userService'];

  function FriendsRequestController ($scope, $timeout, userService) {
    var vm = this;

    vm.acceptRequest = acceptRequest;
    vm.rejectRequest = rejectRequest;
    vm.friendRequests = [];
    vm.userId;

    $scope.$on('$ionicView.enter', function(e) {
      vm.userId = window.localStorage['uid'];
      // getting friend requests


      // getting friend requests
      ref.child('friendRequests').child(vm.userId).on('value', function(snapshot) {
        vm.friendRequests = [];

        snapshot.forEach(function(child) {
          var uId = child.val();
          ref.child('users').child(uId).on('value', function(snapshot) {
            var user = snapshot.val();
            user.id = uId;
            ref.child('profilepicture').child(uId).once('value', function(snapshot) {
              if (snapshot.val()) {
                user.pic = snapshot.val().profilepicture || userService.getProfilePicture();
              }
              $timeout(function() {
                vm.friendRequests.push(user);
              });
            });
          });
        });
      });
    });

    function acceptRequest(friend) {
      var friendId = friend.id;

      // if the friend is already in user's friendlist, it won't add them again
      ref.child('friends').child(vm.userId).once('value', function(snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === friendId) {
            return;
          }
        }
        ref.child('friends').child(vm.userId).push(friendId);
        ref.child('friends').child(friendId).push(vm.userId);
      });

      // remove this person from friend request
      ref.child('friendRequests').child(vm.userId).once('value', function(snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === friendId) {
            ref.child('friendRequests').child(vm.userId).child(id).remove();
          }
        }
      });
    }

    function rejectRequest(friend) {
      var friendId = friend.id;
      // remove from friend request
      ref.child('friendRequests').child(vm.userId).once('value', function (snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === friendId) {
            ref.child('friendRequests').child(vm.userId).child(id).remove();
          }
        }
      });
    }
  }
})();
