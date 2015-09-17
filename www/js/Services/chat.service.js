(function() {
  'use strict';

  angular.module('starter.services').factory('chatService', chatService);

  chatService.$inject = ['userService'];

  function chatService(userService) {
    function getChats(chats) {
      return new Promise(function(resolve, reject) {
        var chatsList = [];
        for (var id in chats) {
          userService.getCompleteUser(id).then(function(user) {
            chatsList.push(user);
            if (chatsList.length === Object.keys(chats).length) {
              resolve(chatsList);
            }
          });
        }
      });
    }

    return {
      'getChats': getChats
    };
  }
})();