angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {

  console.log('login controller initiated');

  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.createUser = function(user) {
    console.log('createUer function called!');
    if(user && user.email && user.password && user.displayname) {
      $ionicLoading.show({
        template: 'Signing Up'
      });

      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function(userData) {
        alert('user created successfully!');
        ref.child('users').child(userData.uid).set({
          email: user.email,
          displayName: user.displayname
        });
        $ionicLoading.hide();
        $scope.modal.hide();
      }).catch(function(error) {
        alert('Error: ' + error);
        $ionicLoading.hide();
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  $scope.signIn = function(user) {
    if(user && user.email && user.pwdForLogin) {

      $ionicLoading.show({
        template: 'Signing in...'
      });

      auth.$authWithPassword({
        email: user.email,
        password: user.pwdForLogin
      }).then(function(authData) {
        console.log('Logged in as ' + authData.uid);
        //$rootScope.uid = authData.uid;
        window.localStorage['uid'] = authData.uid;
        ref.child("users").child(authData.uid).once('value', function (snapshot) {
          var val = snapshot.val();
          $scope.$apply(function() {
            window.localStorage['displayName'] = val;
          });
        });
        $ionicLoading.hide();
        $state.go("tab.rooms");
      }).catch(function(error) {
        alert('Authentication failed ' + error.message);
        $ionicLoading.hide();
      });
    } else {
      alert('please enter email and password');
    }
  };
})


.controller('ChatsCtrl', function($scope, Chats) {
  console.log("Chat Controller initialized");
  $scope.chats = Chats.all();
})

.controller('RoomsCtrl', function ($scope, $state, $rootScope, GPS, $ionicLoading) {
  console.log("Rooms Controller initialized");

  //set up user list
  $scope.users = [];

  $ionicLoading.show({
    template: 'Loading Matches...'
  });
  //set User position
  GPS.getGeo().then(function(position) {
    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    var uid = window.localStorage['uid'];
    geoFire.set(uid, [latitude, longitude]).then(function () {
      console.log("Provided key has been added to GeoFire");

      var geoQuery = geoFire.query({
        center: [latitude, longitude],
        radius: 10.000 //kilometers
      });

      geoQuery.on("key_entered", function(key, location, distance) {
        $ionicLoading.hide();
        console.log("User " + key + " found at " + location + " (" + distance + " km away)");
        if(key !== uid) {
          ref.child("users").child(key).once('value', function (snapshot) {
            var val = snapshot.val();
            $scope.$apply(function () {
              $scope.users.push(val);
            });
          });
        }
      });

      geoQuery.on("key_exited", function(key, location, distance) {
        console.log("User " + key + " left query to " + location + " (" + distance + " km away)");
      });

    }, function (error) {
      console.log("Error: " + error);
    });
  });

});
