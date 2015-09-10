angular.module('starter.services', ['firebase'])
.factory("editProf", function(){
  var checker = false;
  return {checker: checker};
});

