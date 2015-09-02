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

.controller('RoomsCtrl', function ($scope, $state, $rootScope, GPS, $ionicLoading) {
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
})
.controller('MessageCtrl', function($scope, $stateParams) {
  $scope.sendMessage = function(message) {
  };
})

.controller('ProfileCtrl', function($scope, $state, $stateParams, $timeout) {
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
    // if they are not already friends, should send the friend a request so they can accept or reject
    ref.child('friends').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          // ideally make the add friend button not available somehow
          console.log('This person is already your friend');
          return;
        }
      }
      ref.child('friendRequests').child(friendId).push(userId);
      $timeout(function() {
        $scope.sentReq = true;
      });
    });
    // notify that friend request has been sent
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
    console.log(userId)
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

// need to make a new friend request controller to pass in stateparam user id
.controller('FriendReqCtrl', function($scope, $timeout) {
  var userId = window.localStorage['uid'];
  // getting friend requests
  $scope.acceptRequest = function(friend) {
    var friendId = friend[0];
    ref.child('friends').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          return;
        }
      }
      ref.child('friends').child(userId).push(friendId);
      ref.child('friends').child(friendId).push(userId);
    });

    // remove this person from friend request
    ref.child('friendRequests').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          ref.child('friendRequests').child(userId).child(id).remove();
        }
      }
    });
  };

  $scope.rejectRequest = function(friend) {
    var friendId = friend[0];
    // remove from friend request
    ref.child('friendRequests').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          ref.child('friendRequests').child(userId).child(id).remove();
        }
      }
    });
  };

  // getting friend requests
  ref.child('friendRequests').child(userId).on('value', function(snapshot) {
    $scope.friendRequests = [];
    var friendsId = snapshot.val();
    for (var id in friendsId) {
      var uId = friendsId[id];
      ref.child('users').child(uId).once('value', function(snapshot) {
        $timeout(function() {
          $scope.friendRequests.push([uId, snapshot.val()]);
        });
      });
    }
  });
})

.controller('FriendsCtrl', function($scope, $timeout) {
  var userId = window.localStorage['uid'];

  // check for friend requests
  ref.child('friendRequests').child(userId).on('value', function(snapshot) {
    $timeout(function() {
      if (snapshot.val()) {
        $scope.hasReq = true;
      }
    });
  });

  // getting friends
  ref.child("friends").child(userId).on('value', function (snapshot) {
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
