(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('SearchController', SearchController);

    SearchController.$inject = ['$state', 'GPS', '$ionicLoading', '$timeout'];

    function SearchController ($state, GPS, $ionicLoading, $timeout) {
      var vm = this;
      //set up user list
      vm.users = [];

      vm.sendToProfile = function () {
        $state.go('profile');
      };

      $ionicLoading.show({
        template: '<p>Loading Matches...</p><ion-spinner></ion-spinner>'
      });

      //set User position
      GPS.getGeo().then(function (position) {
        var longitude = position.coords.longitude;
        var latitude = position.coords.latitude;
        var uid = window.localStorage['uid'];
        geoFire.set(uid, [latitude, longitude]).then(function () {

          var geoQuery = geoFire.query({
            center: [latitude, longitude],
            radius: 10.000 //kilometers
          });

          geoQuery.on("key_entered", function (key, location, distance) {
            if (key !== uid) {
              ref.child("users").child(key).once('value', function (snapshot) {
                var val = snapshot.val();
                val.uid = key;
                val.distance = distance;

                ref.child('interests').child(key).once('value', function (snapshot) {
                  val.interests = snapshot.val();

                  ref.child('profilepicture').child(key).once('value', function (snapshot) {
                    $ionicLoading.hide();
                    if (snapshot.val()) {
                      val.profilepicture = snapshot.val().profilepicture;
                    }
                    $timeout(function () {
                      vm.users.push(val);
                    });
                  });
                });
              });
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
    }
})();
