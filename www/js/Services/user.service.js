(function() {
  'use strict';
  angular.module('starter.services')
    .factory('userService', userService);

  function userService() {
    function get(key, id){
      return new Promise(function(resolve, reject){
        ref.child(key).child(id).once('value', function(result){
          if(!result) reject(new Error('User not found'));
          else resolve(result.val());
        });
      });
    }

    function getCompleteUser(id){
      return new Promise(function(resolve, reject){
        get('users', id).then(function (user) {
          user.uid = id;

          get('interests', user.uid).then(function (interests) {
            user.interests = interests;

            get('profilepicture', id).then(function (picture) {
              if (picture) {
                user.profilepicture = picture.profilepicture;
              }
              resolve(user);
            });
          });
        });
      });

    }

    return {
      'get': get,
      'getCompleteUser': getCompleteUser
    }
  }
})();
