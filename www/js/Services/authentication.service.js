(function() {
  'use strict';
  angular.module('starter.services')
    .factory("Auth", Authentication);

  Authentication.$insert = ["$firebaseAuth"];
  function Authentication($firebaseAuth) {
    return $firebaseAuth(ref);
  }
})();
