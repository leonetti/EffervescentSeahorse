(function() {
  'use strict';
  angular.module('starter.services')
    .factory('GPS', ['$cordovaGeolocation', GPS]);

  GPS.$insert = ['$cordovaGelocation'];
  function GPS($cordovaGeolocation) {
    function getGeo(options) {
      options = options || {timeout: 30000, enableHighAccuracy: true};

      return $cordovaGeolocation.getCurrentPosition(options);
    }

    return {
      getGeo: getGeo
    }
  }
})();
