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
        $state.go("tab.search");
      }).catch(function(error) {
        alert('Authentication failed ' + error.message);
        $ionicLoading.hide();
      });
    } else {
      alert('please enter email and password');
    }
  };
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

  ref.child('pictures').child($stateParams.userId).once('value', function (snapshot) {
    $scope.picGallery = snapshot.val();
    console.log($scope.picGallery);
  });


  $scope.sendChat = function() {
    $state.go('tab.chat');
  };

  var userId = window.localStorage['uid'];
  var friendId = $stateParams.userId;

  // check if the user is blocked by the person in the profile
  // if the user is blocked, do not show the add friend or chat buttons, also don't let them unblock
  ref.child('blockedUsers').child(friendId).on('value', function(snapshot) {
    for (var id in snapshot.val()) {
      if (snapshot.val()[id] === userId) {
        // don't let the user see the friend or chat buttons
        $scope.blocked = true;
        $scope.showUnblock = false;
        return;
      }
    }
    $scope.blocked = false;
  });

  // if the profile that the user is viewing is currently blocked by the user, give them option to unblock them
  ref.child('blockedUsers').child(userId).on('value', function(snapshot) {
    for (var id in snapshot.val()) {
      if (snapshot.val()[id] === friendId) {
        $timeout(function() {
          $scope.showUnblock = true;
        });
      }
    }
  });

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

  $scope.blockUser = function() {
    ref.child('blockedUsers').child(userId).push(friendId);
    // remove them from friends list if they are currently friends
    $scope.removeFriend();
    $scope.showUnblock = true;
  };

  $scope.active = 'Interests';

  $scope.setActive = function(type) {
      $scope.active = type;
  };

  $scope.isActive = function(type) {
    return type === $scope.active;
  };

  $scope.unblockUser = function() {
    ref.child('blockedUsers').child(userId).once('value', function(snapshot) {
      for (var id in snapshot.val()) {
        if (snapshot.val()[id] === friendId) {
          ref.child('blockedUsers').child(userId).child(id).remove();
          $scope.showUnblock = false;
        }
      }
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
      $scope.bio = snapshot.val().users[userId].bio
      $scope.profilepic = snapshot.val().profilepicture[userId].profilepicture;
      if(snapshot.val().interests[userId]){
        $scope.interests = snapshot.val().interests[userId];
        for(var i in $scope.interests){
          activityObj[$scope.interests[i].activity] = 1;
        }
        for(var k = 0; k < activities.length; k++){
          if(!activityObj[activities[k]]){
            activitiesArr.push(activities[k]);
          }
        }
        $scope.activities = activitiesArr;
      }else{
        $scope.activities = snapshot.val().activities;
      }
    });
  });

  $scope.addMedia = function(destination) {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Choose Profile Picture',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index, destination);
      }
    });
  };

  $scope.addImage = function(type, destination) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type, destination).then(function() {
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
  };

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
  };
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
      };
    } else {
      return {
        'color': 'red',
        'text-align': 'left'
      };
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
      var friendId = friend.id;

      // remove this person from block list if they are added and accept their request
      ref.child('blockedUsers').child(friendId).once('value', function(snapshot) {
        for (var id in snapshot.val()) {
          if (snapshot.val()[id] === userId) {
            ref.child('blockedUsers').child(friendId).child(id).remove();
          }
        }
      });

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
      var friendId = friend.id;
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
      snapshot.forEach(function(child) {
        var uId = child.val();
        ref.child('users').child(uId).on('value', function(snapshot) {
          var user = snapshot.val();
          user.id = uId;
          ref.child('profilepicture').child(uId).once('value', function(snapshot) {
            if (snapshot.val()) {
              user.pic = snapshot.val().profilepicture;
            }
            $timeout(function() {
              $scope.friendRequests.push(user);
            });
          });
        });
      });
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
      snapshot.forEach(function(child) {
        var fId = child.val();
        ref.child('users').child(fId).once('value', function(snap) {
          var user = snap.val();
          user.id = fId;
          ref.child('interests').child(fId).once('value', function(snap) {
            user.interests = snap.val();
            ref.child('profilepicture').child(fId).once('value', function(snap) {
              if (snap.val()) {
                user.pic = snap.val().profilepicture;
              }
              $timeout(function() {
                $scope.friends.push(user);
              });
            });
          });
        });
      });
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
