(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope','$state', 'GPS', '$ionicLoading', '$timeout', 'userService'];

    function SearchController ($scope, $state, GPS, $ionicLoading, $timeout, userService) {
      var vm = this;

      vm.sendToProfile = function () {
        $state.go('profile');
      };

      $scope.$on('$ionicView.enter', function(e) {

        //set up user list
        vm.users = [];

        $ionicLoading.show({
          template: '<p>Loading Matches...</p><ion-spinner></ion-spinner>'
        });

        //set User position
        GPS.getGeo().then(function (position) {
          var longitude = position.coords.longitude;
          var latitude = position.coords.latitude;
          var uid = userService.getCurrentUserId();

          $ionicLoading.hide();
          geoFire.set(uid, [latitude, longitude]).then(function () {

            var geoQuery = geoFire.query({
              center: [latitude, longitude],
              radius: 10.000 //kilometers
            });

            geoQuery.on("key_entered", function (id, location, distance) {
              if (id !== uid) {
                 userService.getCompleteUser(id).then(function(user){
                   if(distance < 1.61) {
                    distance = Math.floor((distance * 3280)) + ' feet away'
                   } else {
                    distance = (distance / 1.61).toFixed(1) + ' miles away'
                   }
                   user.distance = distance;
                   user.id = id;
                   $timeout(function(){
                     vm.users.push(user);
                   });
                 })
              }
            });

            geoQuery.on("key_exited", function (key, location, distance) {
              console.log("User " + key + " left query to " + location + " (" + distance + " km away)");
            });

          }, function (error) {
            console.log("Error: " + error);
          });
        }).catch(function (error) {
          console.error(error);
        });
      });
    }
})();
