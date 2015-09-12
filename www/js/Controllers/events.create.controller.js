(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('CreateEventsCtrl', CreateEventsCtrl);

    CreateEventsCtrl.$inject = ['$scope', '$state', '$ionicModal', '$timeout'];

    function CreateEventsCtrl ($scope, $state, $ionicModal, $timeout) {
      var vm = this;
      vm.activities = [];
      console.log('initialized CreateEventsController');
      $ionicModal.fromTemplateUrl('templates/eventModal.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      ref.child('activities').on('value', function(snapshot) {
        $timeout(function() {
          for (var i = 0; i < snapshot.val().length; i++) {
            vm.activities.push({
              title: snapshot.val()[i],
              model: false
            });
          }
        });
      });

      vm.sendEventInfo = function() {
        $scope.modal.hide();
        vm.userId = window.localStorage.uid;
        var curActivities = [];
        for(var i=0; i<vm.activities.length; i++) {
          if(vm.activities[i].model) {
            curActivities.push(vm.activities[i].title);
          }
        }
        console.log('event Date', vm.eventDate);
        ref.child('events').push({
          activities: curActivities,
          description: vm.description,
          numPeople: vm.numPeople,
          eventDate: vm.eventDate.toString().substring(0,15),
          eventTime: vm.eventTime,
          location: vm.eventLoc,
          creator: vm.userId,
        });
      };
    };
})();
