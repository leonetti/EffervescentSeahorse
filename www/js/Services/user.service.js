(function() {
  'use strict';
  angular.module('starter.services')
    .factory('userService', userService);

  function getCurrentUserId(){
    return window.localStorage['uid'];
  }

  function setCurrentUserId(id){
    window.localStorage['uid'] = id;
  }
  function userService() {
    function getDefaultPicture(){
      return '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'
    }
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
              } else {
                user.profilepicture = getDefaultPicture();
              }
              resolve(user);
            });
          });
        });
      });

    }

    return {
      'get': get,
      'getCompleteUser': getCompleteUser,
      'getCurrentUserId': getCurrentUserId,
      'setCurrentUserId': setCurrentUserId,
      'getDefaultPicture' : getDefaultPicture
    }
  }
})();
