(function() {
  'use strict';
  angular.module('starter.services')
    .factory("ImageService", Image);

  Image.$insert = ["$cordovaCamera", "$q"];
  function Image($cordovaCamera, $q) {
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    function optionsForType(type) {
      var source;
      switch (type) {
        case 0:
          source = Camera.PictureSourceType.CAMERA;
          break;
        case 1:
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }
      return {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: source,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        targetWidth: 500,
        targetHeight: 500
      };
    }

    function saveMedia(type, destination) {
      console.log(destination);
      return $q(function(resolve, reject) {
        var options = optionsForType(type);
        $cordovaCamera.getPicture(options).then(function(imageData) {
          if(destination === 0){
            ref.child('profilepicture').child(window.localStorage.uid).update({
              'profilepicture': imageData,
            })
            .then(function(info) {
              console.log(imageData);
            }, function(e) {
              reject();
            });
          }else{
            ref.child('pictures').child(window.localStorage.uid).push({
              'picture': imageData,
            })
            .then(function(info) {
              console.log(imageData);
            }, function(e) {
              reject();
            });
          }
        });
      });
    }
    return {
      handleMediaDialog: saveMedia
    }
  }
})();
