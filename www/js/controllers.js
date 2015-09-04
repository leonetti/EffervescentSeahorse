angular.module('starter.controllers', [])

.controller('MyCtrl', function($scope, $ionicHistory) {
  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };
})

.controller('LoginCtrl', function($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope, $timeout) {
  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.createUser = function(user) {
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
        //$rootScope.uid = authData.uid;
        window.localStorage['uid'] = authData.uid;
        ref.child("users").child(authData.uid).once('value', function (snapshot) {
          var val = snapshot.val();
          $timeout(function() {
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

.controller('RoomsCtrl', function ($scope, $state, $rootScope, GPS, $ionicLoading, $timeout) {
  //set up user list
  $scope.users = [];

  $scope.sendToProfile = function(user) {
    $state.go('profile');
  };

  $ionicLoading.show({
    template: '<p>Loading Matches...</p><ion-spinner></ion-spinner>'
  });
  //set User position
  GPS.getGeo().then(function(position) {
    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    var uid = window.localStorage['uid'];
    geoFire.set(uid, [latitude, longitude]).then(function () {

      var geoQuery = geoFire.query({
        center: [latitude, longitude],
        radius: 10.000 //kilometers
      });

      geoQuery.on("key_entered", function(key, location, distance) {
        if(key !== uid) {
          ref.child("users").child(key).once('value', function (snapshot) {
            var val = snapshot.val();
            val.uid = key;

            ref.child('interests').child(key).once('value', function (snapshot) {
              $ionicLoading.hide();
              val.interests = snapshot.val();

              ref.child('profilepicture').child(key).once('value', function (snapshot) {
                if(snapshot.val()){
                  val.profilepicture = snapshot.val().profilepicture;
                }
                $scope.$apply(function(){
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

.controller('ProfileCtrl', function($scope, $state, $stateParams, $timeout) {
  $scope.user;
  $scope.interests;
  ref.child('interests').child($stateParams.userId).once('value', function (snapshot) {
    $timeout(function() {
      $scope.interests = snapshot.val();
    });
  });

  ref.child('profilepicture').child($stateParams.userId).once('value', function (snapshot) {
    $scope.profpic = snapshot.val().profilepicture;
  });

  ref.child("users").child($stateParams.userId).once('value', function (snapshot) {
    var val = snapshot.val();
    val.uid = $stateParams.userId;
    $timeout(function () {
      $scope.user = (val);
    });
  });

  $scope.sendChat = function() {
    $state.go('tab.chat');
  };

  var userId = window.localStorage['uid'];
  var friendId = $stateParams.userId;
  // check if they are already friends
  ref.child('friends').child(userId).on('value', function(snapshot) {
    for (var id in snapshot.val()) {
      if (snapshot.val()[id] === friendId) {
        $timeout(function() {
          $scope.friendStatus = true;
          $scope.sentReq = false;
        });
      }
    }
  });
  // check if the friend request has already been sent
  ref.child('friendRequests').child(friendId).on('value', function(snapshot) {
    for (var id in snapshot.val()) {
      if (snapshot.val()[id] === userId) {
        $timeout(function() {
          $scope.sentReq = true;
        });
      }
    }
  });
  $scope.addFriend = function(){
    ref.child('friends').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          return;
        }
      }
      ref.child('friendRequests').child(friendId).push(userId);
      // notify that friend request has been sent
      $timeout(function() {
        $scope.sentReq = true;
      });
    });
  };

  $scope.removeFriend = function() {
    var userId = window.localStorage['uid'];
    var friendId = $stateParams.userId;

    ref.child('friends').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          ref.child('friends').child(userId).child(id).remove();
        }
      }
    });

    ref.child('friends').child(friendId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === userId) {
          ref.child('friends').child(friendId).child(id).remove();
        }
      }
    });

    $timeout(function() {
      $scope.friendStatus = false;
    });
  };
})

.controller('EditProfileCtrl', function ($scope, $rootScope, $ionicActionSheet, ImageService, $timeout) {
  var userId = window.localStorage.uid;

  ref.on('value', function(snapshot){
    $timeout(function(){
      var activityObj = {};
      var activities = snapshot.val().activities;
      var activitiesArr = [];
      if(snapshot.val().interests){
        $scope.interests = snapshot.val().interests[userId];
        $scope.profilepic = snapshot.val().profilepicture[userId].profilepicture;
        //for(var i in $scope.interests)
        for(var i in $scope.interests){
          activityObj[$scope.interests[i].activity] = 1
        }
        for(var i = 0; i < activities.length; i++){
          if(!activityObj[activities[i]]){
            activitiesArr.push(activities[i]);
          }
        }
        $scope.activities = activitiesArr;
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
    for(var i in $scope.interests){
      if($scope.interests[i].activity === item){
        alert('Already have that interests');
        return;
      }
    }
        ref.child('interests').child(userId).push({
          'activity': item
        });
  }

  $scope.addBio = function(item){
    ref.child('users').child(userId).update({
      'bio': item,
    });
  };

  $scope.removeInterest = function(item){
    var activity = this.interest.activity;
    for(var i in $scope.interests){
      if($scope.interests[i].activity === activity){
        ref.child('interests').child(userId).child(i).remove();
        alert('removed that shit!');
        return;
      }
    }

  }

})

.controller('MessageCtrl', function($scope, $stateParams, $timeout, $ionicScrollDelegate) {
  $scope.user;
  $scope.text = '';
  $scope.messages = [];

  ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).on('value', function(snapshot) {
    $scope.messages = [];
    $timeout(function() {
      for(var key in snapshot.val()) {
        $scope.messages.push(snapshot.val()[key]);
      }
    });
    $ionicScrollDelegate.scrollBottom();
  });

  $scope.setStyle = function(id) {
    if(id === window.localStorage['uid']) {
      return {
        'color': 'green',
        'text-align': 'right'
      }
    } else {
      return {
        'color': 'red',
        'text-align': 'left'
      }
    }
  };

  $scope.sendMessage = function(message) {
    $scope.messages = [];
    if(message !== "") {
      ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).push({
        sender: window.localStorage['uid'],
        text: message
      })
    }
    $ionicScrollDelegate.scrollBottom();
  };
})

// need to make a new friend request controller to pass in stateparam user id
.controller('FriendReqCtrl', function($scope, $timeout) {
  $scope.$on('$ionicView.enter', function(e) {
    var userId = window.localStorage['uid'];
    // getting friend requests
    $scope.acceptRequest = function(friend) {
      var friendId = friend[0];

      // if the friend is already in user's friendlist, it won't add them again
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
  });
})

.controller('FriendsCtrl', function($scope, $timeout) {

  $scope.$on('$ionicView.enter', function(e){
    var userId = window.localStorage['uid'];

    // check for friend requests
    ref.child('friendRequests').child(userId).on('value', function(snapshot) {
      $timeout(function() {
        if (snapshot.val()) {
          $scope.hasReq = true;
        } else {
          $scope.hasReq = false;
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
})

.controller('LogoutCtrl', function($scope, $state, $window, $ionicHistory) {
  $scope.logout = function() {
    delete window.localStorage['displayName'];
    delete window.localStorage['uid'];
    ref.unauth();
    $ionicHistory.clearCache().then(function() {
      console.log('cleared views');
    });
    $state.go('login');
  };
});
