angular.module('starter.controllers', [])

// .controller('DashCtrl', function($scope) {})

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
        $rootScope.uid = authData.uid;
        ref.child("users").child(authData.uid).once('value', function (snapshot) {
          var val = snapshot.val();
          $scope.$apply(function() {
            $rootScope.displayName = val;
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
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // $scope.chats = Chats.all();
  // $scope.remove = function(chat) {
  //   Chats.remove(chat);
  // };
  console.log("Chat Controller initialized");
  $scope.chats = Chats.all();
})

.controller('RoomsCtrl', function ($scope, $state, $rootScope, GPS) {
  console.log("Rooms Controller initialized");

  //set up user list
  $scope.users = [];
  //set User position
  GPS.getGeo().then(function(position) {
    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    geoFire.set($rootScope.uid, [latitude, longitude]).then(function () {
      console.log("Provided key has been added to GeoFire");

      var geoQuery = geoFire.query({
        center: [latitude, longitude],
        radius: 10.000 //kilometers
      });

      geoQuery.on("key_entered", function(key, location, distance) {
        console.log('something');
        console.log("User " + key + " found at " + location + " (" + distance + " km away)");
      });

      geoQuery.on("key_exited", function(key, location, distance) {
        console.log("User " + key + " left query to " + location + " (" + distance + " km away)");
      });

    }, function (error) {
      console.log("Error: " + error);
    });
  });

  });

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

// .controller('AccountCtrl', function($scope) {
//   $scope.settings = {
//     enableFriends: true
//   };
// });
