angular.module('starter.services', ['firebase'])

.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  return $firebaseAuth(ref);
}])

.factory('GPS', ['$cordovaGeolocation', function($cordovaGeolocation) {
  return {
    getGeo: function(options) {
      options = options || { timeout: 30000, enableHighAccuracy: true };

      return $cordovaGeolocation.getCurrentPosition(options);
    }
  }
}]);

// .factory("Rooms", function($firebase) {
//   var ref = new Firebase('https://crackling-heat-1995.firebaseio.com/');
//   var rooms = $firebase(ref.child('rooms')).$asArray();

//   return {
//     all: function () {
//       return rooms;
//     },
//     get: function (roomId) {
//       // Simple index lookup
//       return rooms.$getRecord(roomId);
//     }
//   };
// });


// .factory('Chats', function() {
//   // Might use a resource here that returns a JSON array

//   // Some fake testing data
//   var chats = [{
//     id: 0,
//     name: 'Ben Sparrow',
//     lastText: 'You on your way?',
//     face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
//   }, {
//     id: 1,
//     name: 'Max Lynx',
//     lastText: 'Hey, it\'s me',
//     face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
//   }, {
//     id: 2,
//     name: 'Adam Bradleyson',
//     lastText: 'I should buy a boat',
//     face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
//   }, {
//     id: 3,
//     name: 'Perry Governor',
//     lastText: 'Look at my mukluks!',
//     face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
//   }, {
//     id: 4,
//     name: 'Mike Harrington',
//     lastText: 'This is wicked good ice cream.',
//     face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
//   }];

//   return {
//     all: function() {
//       return chats;
//     },
//     remove: function(chat) {
//       chats.splice(chats.indexOf(chat), 1);
//     },
//     get: function(chatId) {
//       for (var i = 0; i < chats.length; i++) {
//         if (chats[i].id === parseInt(chatId)) {
//           return chats[i];
//         }
//       }
//       return null;
//     }
//   };
// });
