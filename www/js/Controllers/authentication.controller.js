(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$ionicModal', '$state', '$firebaseAuth', '$ionicLoading', '$timeout'];

  function AuthenticationController ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $timeout) {
    var vm = this;
    vm.createUser = createUser;
    vm.signIn = signIn;

    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope
    }).then(function(modal) {
      vm.modal = modal;
    });

    function createUser(user) {
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

    function signIn(user) {
      if(user && user.email && user.pwdForLogin) {

        $ionicLoading.show({
          template: 'Signing in...'
        });

        auth.$authWithPassword({
          email: user.email,
          password: user.pwdForLogin
        }).then(function(authData) {
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
  }
})();
