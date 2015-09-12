(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventGroupCtrl', EventGroupCtrl);

  EventGroupCtrl.$inject = ['$scope', '$stateParams', '$timeout', '$ionicScrollDelegate'];

  function EventGroupCtrl ($scope, $stateParams, $timeout, $ionicScrollDelegate) {
    var vm = this;

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
