(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('FriendsController', FriendsController);

  FriendsController.$inject = ['$scope', '$timeout', 'userService', 'friendService'];

  function FriendsController ($scope, $timeout, userService, friendService) {
    var vm = this;


    $scope.$on('$ionicView.enter', function(e) {
      var userId = userService.getCurrentUserId();
      vm.hasReq;
      vm.friends = [];
      // check for friend requests
      ref.child('friendRequests').child(userId).on('value', function(snapshot) {
        $timeout(function() {
          vm.hasReq = Boolean(snapshot.val());
        });
      });

      // getting friends list
      ref.child('friends').child(userId).on('value', function(snapshot) {
        friendService.getFriends(snapshot.val()).then(function(friends) {
          $timeout(function() {
            vm.friends = friends;
          });
        });
      });
    });
  }
})();
