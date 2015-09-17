(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventGroupCtrl', EventGroupCtrl);

    EventGroupCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams', '$ionicScrollDelegate', 'userService'];

    function EventGroupCtrl ($scope, $state, $timeout, $stateParams, $ionicScrollDelegate, userService) {
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

      vm.sendMessage = function(message) {
        if(message !== "") {
          ref.child('users').child(window.localStorage['uid']).once('value', function(snapshot) {
            var displayName = snapshot.val().displayName;
            var photo;
            ref.child('events').child(vm.eventId).child('messages').push({
              sender: window.localStorage['uid'],
              text: message,
              date: Firebase.ServerValue.TIMESTAMP,
              displayName: displayName,
              photo: vm.photo
            });
          });
        }
        vm.text = '';
        $ionicScrollDelegate.scrollBottom();
      }

      userService.getCompleteUser(window.localStorage['uid']).then(function(user){
<<<<<<< HEAD
        vm.photo = user.profilepicture || userService.getDefaultPicture();
      });
    }
    EventGroupCtrl.$inject = ['$scope', '$state', '$timeout', '$stateParams', '$ionicScrollDelegate', 'userService'];

    function EventGroupCtrl ($scope, $state, $timeout, $stateParams, $ionicScrollDelegate, userService) {
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

      vm.sendMessage = function(message) {
        if(message !== "") {
          ref.child('users').child(window.localStorage['uid']).once('value', function(snapshot) {
            var displayName = snapshot.val().displayName;
            var photo;
            ref.child('events').child(vm.eventId).child('messages').push({
              sender: window.localStorage['uid'],
              text: message,
              date: Firebase.ServerValue.TIMESTAMP,
              displayName: displayName,
              photo: vm.photo
            });
          });
        }
        vm.text = '';
        $ionicScrollDelegate.scrollBottom();
      }

      userService.getCompleteUser(window.localStorage['uid']).then(function(user){
=======
>>>>>>> 89c73efaee8f056b275fb4498c1b8826e0115138
        vm.photo = user.profilepicture;
      });
    }
})();
