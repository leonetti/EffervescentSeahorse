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
      vm.liked = [];

      ref.child('events').child(vm.eventId).child('messages').on('value', function(snapshot) {
        vm.messages = [];
        $timeout(function() {
          for(var key in snapshot.val()) {
            vm.messages.push(snapshot.val()[key]);
          }
        $ionicScrollDelegate.scrollBottom();
        });
      });

      vm.like = function($index) {
        var message = vm.messages[$index];

        ref.child('events').child(vm.eventId).child('messages').once('value', function(snapshot) {
          for(var eid in snapshot.val()) {
            ref.child('events').child(vm.eventId).child('messages').child(eid).once('value', function(snap) {
              if(snap.val().date === message.date) {
                var likes = snap.val().liked + 1;
                ref.child('events').child(vm.eventId).child('messages').child(eid).update({
                  liked: likes
                });
                vm.liked.push(snap.val().date);
                console.log(vm.liked);
              }
            })
          }
        });
      }

      vm.unLike = function($index) {
        var message = vm.messages[$index];
        ref.child('events').child(vm.eventId).child('messages').once('value', function(snapshot) {
          for(var eid in snapshot.val()) {
            ref.child('events').child(vm.eventId).child('messages').child(eid).once('value', function(snap) {
              if(snap.val().date === message.date) {
                var index = vm.liked.indexOf(snap.val().date);
                if(index !== -1) {
                  var likes = snap.val().liked - 1;
                  ref.child('events').child(vm.eventId).child('messages').child(eid).update({
                    liked: likes
                  });
                  vm.liked.splice(index);
                } else {
                  vm.like($index);
                }
              }
            })
          }
        })
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
