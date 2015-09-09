(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('MessagesController', MessagesController);

  MessagesController.$inject = ['$scope', '$stateParams', '$timeout', '$ionicScrollDelegate'];

  function MessagesController ($scope, $stateParams, $timeout, $ionicScrollDelegate) {
    var vm = this;


    vm.user;
    vm.text = '';
    vm.messages = [];
    vm.setStyle = setStyle;
    vm.sendMessage = sendMessage;

    ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).on('value', function(snapshot) {
      vm.messages = [];
      $timeout(function() {
        for(var key in snapshot.val()) {
          vm.messages.push(snapshot.val()[key]);
        }
      });
      $ionicScrollDelegate.scrollBottom();
    });

    function setStyle(id) {
      if(id === window.localStorage['uid']) {
        return 'chat-bubble--right';
      } else {
        return 'chat-bubble--left';
      }
    }

    function sendMessage(message) {
      if(message !== "") {
        vm.messages = [];
        ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).push({
          sender: window.localStorage['uid'],
          text: message
        });
        ref.child('rooms').child($stateParams.userId).child(window.localStorage['uid']).push({
          sender: window.localStorage['uid'],
          text: message
        });
      }
      vm.text = '';
      $ionicScrollDelegate.scrollBottom();
    }

  }
})();
