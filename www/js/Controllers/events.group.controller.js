(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventGroupCtrl', EventGroupCtrl);

    EventGroupCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams', '$ionicScrollDelegate', 'userService'];

    function EventGroupCtrl ($scope, $state, $timeout, $stateParams, $ionicScrollDelegate, userService) {
      console.log('initialized');
      var vm = this;
      vm.text = '';
      vm.messages = [];
      vm.eventId = $stateParams.eventId;
      vm.photo;

      ref.child('events').child(vm.eventId).child('messages').on('value', function(snapshot) {
        vm.messages = [];
        $timeout(function() {
          for(var key in snapshot.val()) {
            vm.messages.push(snapshot.val()[key]);
          }
        $ionicScrollDelegate.scrollBottom();
        });
      });

      vm.like = function(message) {
        console.log('like');
        message.liked++;
        ref.child('events').child(vm.eventId).once('value', function(snapshot) {
          for (var timestamp in snapshot.val()) {
            if (snapshot.val()[timestamp] === message.date) {
              $timeout(function() {

              });
            }
          }
        });
      }

      vm.unLike = function(message) {
        console.log(message);
      }

      vm.sendMessage = function(message) {
        if(message !== "") {
          ref.child('users').child(window.localStorage['uid']).once('value', function(snapshot) {
            var displayName = snapshot.val().displayName;
            var photo;
            var liked = 0;
            ref.child('events').child(vm.eventId).child('messages').push({
              sender: window.localStorage['uid'],
              text: message,
              date: Firebase.ServerValue.TIMESTAMP,
              displayName: displayName,
              photo: vm.photo,
              liked: liked
            });
          });
        }
        vm.text = '';
        $ionicScrollDelegate.scrollBottom();
      }

      userService.getCompleteUser(window.localStorage['uid']).then(function(user){
        vm.photo = user.profilepicture || userService.getDefaultPicture();
      });
    }
})();
