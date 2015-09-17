(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('FriendsRequestController', FriendsRequestController);

  FriendsRequestController.$inject = ['$scope', '$timeout', 'friendService'];

  function FriendsRequestController ($scope, $timeout, friendService) {
    var vm = this;

    vm.acceptRequest = acceptRequest;
    vm.rejectRequest = rejectRequest;
    vm.userId = window.localStorage['uid'];

    $scope.$on('$ionicView.enter', function(e) {

      // getting friend requests
      ref.child('friendRequests').child(vm.userId).on('value', function(snapshot) {
        vm.friendRequests = [];
        friendService.getFriendRequests(snapshot.val()).then(function(requests) {
          $timeout(function() {
            vm.friendRequests = requests;
          });
        });
      });
    });

    function acceptRequest(friend) {
      var friendId = friend.uid;
      friendService.acceptFriend(friendId);
    }

    function rejectRequest(friend) {
      var friendId = friend.uid;
      friendService.rejectFriend(friendId);
    }
  }
})();
