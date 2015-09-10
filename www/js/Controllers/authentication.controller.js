(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$ionicModal', '$state', '$firebaseAuth', '$ionicLoading', '$timeout', '$ionicHistory'];

  function AuthenticationController ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $timeout, $ionicHistory) {
    var vm = this;
    vm.createUser = createUser;
    vm.signIn = signIn;
    vm.logout = logout;

    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function logout () {
      delete window.localStorage['displayName'];
      delete window.localStorage['uid'];
      ref.unauth();
      $ionicHistory.clearCache().then(function() {
        console.log('cleared views');
      });
      $state.go('login');
    }

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
          vm.modal.hide();
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
          user.email = '';
          user.pwdForLogin = '';
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
