(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('ChatController', ChatController);

  ChatController.$inject = ['$scope', '$state', '$timeout'];

  function ChatController ($scope, $state, $timeout) {
    var vm = this;

    vm.sendToProfile = function () {
      $state.go('profile');
    };

    $scope.$on('$ionicView.enter', function(e) {
      vm.users = [];
      var uid = window.localStorage['uid'];
      ref.child('rooms').child(uid).once('value', function (snapshot) {
        Object.keys(snapshot.val()).forEach(function(key) {
          ref.child("users").child(key).once('value', function (snapshot) {
            var val = snapshot.val();
            val.uid = key;

            ref.child('interests').child(key).once('value', function (snapshot) {
              val.interests = snapshot.val();

              ref.child('profilepicture').child(key).once('value', function (snapshot) {
                if (snapshot.val()) {
                  val.profilepicture = snapshot.val().profilepicture;
                }
                $timeout(function () {
                  vm.users.push(val);
                });
              });
            });
          });
        });
      });
    });

  }
})();
