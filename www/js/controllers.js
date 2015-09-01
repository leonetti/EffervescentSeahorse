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


.controller('ChatCtrl', function($scope, Chats, $rootScope) {


  $scope.messages= Chats.all;

  $scope.sendMessage = function(message) {
    ref.child('messages').child($rootScope.uid).push({
      'text': message
    });
  };
})

.controller('RoomsCtrl', function ($scope, $state, $rootScope, GPS, $ionicLoading, $timeout) {
  console.log("Rooms Controller initialized");
  //set up user list
  $scope.users = [];

  $scope.sendToProfile = function(user) {
    $state.go('profile');
  };

  $ionicLoading.show({
    template: 'Loading Matches...'
  });
  //set User position
  GPS.getGeo().then(function(position) {
    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    var uid = window.localStorage['uid'];
    console.log(position.coords);
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
            val.uid = key;

            ref.child('interests').child(key).once('value', function (snapshot) {
              $scope.$apply(function() {

                val.interests = snapshot.val();
                console.log(val.interests);
                $timeout(function () {
                  $scope.users.push(val);
                });
              });
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
  }).catch(function(error){
    console.error(error);
  });
})
.controller('MessageCtrl', function($scope, $stateParams) {
  $scope.sendMessage = function(message) {
  };
})

.controller('ProfileCtrl', function($scope, $state, $stateParams) {
  console.log('Profile Controller initialized');
  console.log($stateParams.userId);
  $scope.user;
  ref.child("users").child($stateParams.userId).once('value', function (snapshot) {
    var val = snapshot.val();
    val.uid = $stateParams.userId;
    $scope.$apply(function () {
      $scope.user = (val);
    });
  });

  ref.child('interests').child($stateParams.userId).once('value', function (snapshot) {
    $scope.$apply(function() {
      console.log('hi', snapshot.val());
      $scope.interests = snapshot.val();
    });
  });
  $scope.sendChat = function() {
    console.log('inSendChat');
    $state.go('tab.chat');
  };


  $scope.addFriend = function(){
    var userId = window.localStorage['uid'];
    var friendId = $stateParams.userId;

    // add the friendId to userId's friends if the friend does not already exist
    ref.child('friends').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          return;
        }
      }
      ref.child('friends').child(userId).push(friendId);
      ref.child('friends').child(friendId).push(userId);
    });
  };
})

.controller('EditProfileCtrl', function ($scope, $rootScope, $ionicActionSheet, ImageService) {
  // $scope.activities = ['basketball', 'tennis']
  var userId = window.localStorage.uid;

  ref.on('value', function(snapshot){
    $scope.$apply(function(){
      $scope.activities = snapshot.val().activities;
      if(snapshot.val().interests){
        $scope.interests = snapshot.val().interests[userId];
      }
    });
  });

  $scope.addMedia = function() {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Choose Profile Picture',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  };

  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      $scope.$apply();
    });
  };

  $scope.addInterest = function(item){
    console.log('Iwork');
    console.log(userId);
    ref.child('interests').child(userId).push({
      'activity': item,
    });
  }
})

.controller('MessageCtrl', function($scope, $stateParams, $timeout) {
  $scope.user;
  $scope.text = '';
  $scope.messages = [];


  ref.child("users").child($stateParams.userId).once('value', function (snapshot) {
    var val = snapshot.val();
    val.uid = $stateParams.userId;
    $timeout(function () {
      $scope.user = (val);
    });
  });
  console.log($stateParams.userId);

  ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).on('value', function(snapshot) {
    $scope.messages = [];
    $timeout(function() {
      for(var key in snapshot.val()) {
        if(snapshot.val()[key].sender) {
          $scope.messages.push(snapshot.val()[key].sender);
        } else if(snapshot.val()[key].receiver) {
          $scope.messages.push(snapshot.val()[key].receiver);
        }
      }
    });
    console.log($scope.messages);
  });

  $scope.setStyle = function(color, align) {
    return {
      'color': color,
      'text-align': align
    }
  }

  $scope.sendMessage = function(message) {
    ref.child("rooms").child(window.localStorage['uid']).child($stateParams.userId).push({
      "sender" : {
        text: message,
        color: 'green',
        align: 'right'
      }
    });
    ref.child("rooms").child($stateParams.userId).child(window.localStorage['uid']).push({
      "receiver" : {
        text: message,
        color: 'red',
        align: 'left'
      }
    });
    $scope.text = '';
  };
})

.controller('FriendsCtrl', function($scope, $timeout) {

  ref.child("friends").child(window.localStorage['uid']).on('value', function (snapshot) {
    $scope.friends = [];
    var friendsId = snapshot.val();
    for (var id in friendsId) {
      var uId = friendsId[id];
      ref.child('users').child(uId).once('value', function(snapshot) {
        $timeout(function() {
          $scope.friends.push([uId, snapshot.val()]);
        });
      });
    }
  });
});
