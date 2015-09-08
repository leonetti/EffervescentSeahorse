(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('FriendsController', FriendsController);

  FriendsController.$inject = ['$scope', '$timeout'];

  function FriendsController ($scope, $timeout) {
    var vm = this;


    $scope.$on('$ionicView.enter', function(e) {
      var userId = window.localStorage['uid'];
      vm.hasReq;
      vm.friends = [];
      // check for friend requests
      ref.child('friendRequests').child(userId).on('value', function(snapshot) {
        $timeout(function() {
          vm.hasReq = Boolean(snapshot.val());
        });
      });

      // getting friends
      ref.child("friends").child(userId).on('value', function (snapshot) {
        snapshot.forEach(function(child) {
          var fId = child.val();
          ref.child('users').child(fId).once('value', function(snap) {
            var user = snap.val();
            user.id = fId;
            ref.child('profilepicture').child(fId).once('value', function(snap) {
              if (snap.val()) {
                user.pic = snap.val().profilepicture;
              }
              $timeout(function() {
                vm.friends.push(user);
              });
            });
          });
        });
      });
    });

  }
})();
