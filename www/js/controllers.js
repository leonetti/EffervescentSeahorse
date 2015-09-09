angular.module('starter.controllers', [])

.controller('MyCtrl', function($scope, editProf, $ionicHistory) {
  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };
  $scope.editProf = function(){
    editProf.checker = !editProf.checker;
    console.log(editProf.checker);
  };
})



.controller('ProfileCtrl', function($scope, $state, $stateParams, $timeout, editProf) {
  $scope.user;
  $scope.interests;
  $scope.edit = editProf.checker;
  console.log($scope.edit)
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

  // check if the user is blocked by the person in the profile
  // if the user is blocked, do not show the add friend or chat buttons
  ref.child('blockedUsers').child(friendId).on('value', function(snapshot) {
    for (var id in snapshot.val()) {
      if (snapshot.val()[id] === userId) {
        // don't let the user see the friend or chat buttons
        $timeout(function() {
          $scope.blocked = true;
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

  $scope.blockUser = function() {
    ref.child('blockedUsers').child(userId).push(friendId);
    // remove them from friends list if they are currently friends
    $scope.removeFriend();
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
      return 'chat-bubble--right';
    } else {
      return 'chat-bubble--left';
    }
  };

  $scope.sendMessage = function(message) {
    $scope.messages = [];
    if(message !== "") {
      ref.child('rooms').child(window.localStorage['uid']).child($stateParams.userId).push({
        sender: window.localStorage['uid'],
        text: message
      });
      ref.child('rooms').child($stateParams.userId).child(window.localStorage['uid']).push({
        sender: window.localStorage['uid'],
        text: message
      });
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
