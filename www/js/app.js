// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var ref = new Firebase('URL');
var geoFire = new GeoFire(ref.child("geolocation"));


angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'firebase'])
.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  // state to represent login screen
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
      "currentAuth" : ["Auth",
        function(Auth) {
          return Auth.$requireAuth();
        }
      ]
    }
  })

  // Each tab has its own nav history stack:

  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchController as vm'
      }
    },
    resolve: {
      "currentAuth" : ["Auth",
        function(Auth) {
          return Auth.$requireAuth();
        }
      ]
    }
  })

  .state('profile', {
      url: '/profile/:userId',
      templateUrl: 'templates/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        "currentAuth": ["Auth",
          function(Auth) {
            return Auth.$waitForAuth();
          }
        ]
      }
    })
  .state('editprofile', {
      url: '/editprofile',
      templateUrl: 'templates/editProfile.html',
      controller: 'EditProfileCtrl',
      resolve: {
        "currentAuth": ["Auth",
          function(Auth) {
            return Auth.$waitForAuth();
          }
        ]
      }
    })

  .state('message', {
    url: '/messages/:userId',
    templateUrl: 'templates/tab-chat.html',
    controller: 'MessageCtrl',
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  .state('tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/tab-friends.html',
        controller: 'FriendsCtrl'
      }
    },
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  .state('friendrequests', {
    url: '/friends/friendrequests',
    templateUrl: 'templates/friendRequests.html',
    controller: 'FriendReqCtrl',
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
