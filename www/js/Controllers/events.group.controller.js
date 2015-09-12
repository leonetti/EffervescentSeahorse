(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('EventGroupCtrl', EventGroupCtrl);

    EventGroupCtrl.$inject = ['$scope', '$state', '$timeout'];

    function EventGroupCtrl ($scope, $state, $timeout) {
      var vm = this;
      vm.messages = [];
    };
})();
