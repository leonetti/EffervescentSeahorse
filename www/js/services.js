angular.module('starter.services', ['firebase'])
.factory("editProf", function(){
  var checker = false;
  return {checker: checker};
})
.factory("geoQueries", function($q){
  var geoQuery;

  function setQuery(latitude, longitude, radius){
    var geoQuery = geoFire.query({
      center: [latitude, longitude],
      radius: radius //kilometers
    });
  }

  return {
    "setQuery": "setQuery"
  }

})
  .factory("userService", function(){
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
              console.log(picture);
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
  });

