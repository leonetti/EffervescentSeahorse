// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var ref = new Firebase('URL');
var geoFire = new GeoFire(ref.child("geolocation"));


angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'firebase'])
.run(function($ionicPlatform) {
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
    controller: 'AuthenticationController as vm',
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  .state('tab.chat', {
    url: '/chat',
    views: {
      'tab-chat': {
        templateUrl: 'templates/tab-chat.html',
        controller: 'ChatController as vm'
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

  .state('tab.events', {
    url:'/events',
    views: {
      'tab-events': {
        templateUrl: 'templates/tab-events.html',
        controller: 'EventsCtrl as vm'
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

  .state('createEvent', {
    url:'/events/create',
    templateUrl: 'templates/createEvent.html',
    controller: 'CreateEventsCtrl as vm'
    // resolve: {
    //   "currentAuth": ["Auth",
    //     function(Auth) {
    //       return Auth.$waitForAuth();
    //     }
    //   ]
    // }
  })

  .state('viewEvent', {
    url:'/events/:eventId',
    templateUrl: 'templates/viewEvent.html',
    controller: 'EventViewCtrl as vm'
  })

  .state('groupChat', {
    url: '/chat/:eventId',
    templateUrl: 'templates/eventChat.html',
    controller: 'EventGroupCtrl as vm'
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

  .state('message', {
    url: '/messages/:userId',
    templateUrl: 'templates/tab-message.html',
    controller: 'MessagesController as vm',
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
        controller: 'FriendsController as vm'
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
    controller: 'FriendsRequestController as vm',
    resolve: {
      "currentAuth": ["Auth",
        function(Auth) {
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsController as vm'
      }
    },
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
