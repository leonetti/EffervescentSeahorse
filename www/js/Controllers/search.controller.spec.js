describe("Test search Controller", function() {
  var $scope, $state, GPS, $ionicLoading, $timeout, userService, vm;

  beforeEach(function () {

    module('starter.controllers');
    module('starter');

    inject(function ($injector) {
      $controller = $injector.get('$controller');
      $scope = $injector.get('$rootScope').$new();
      $state = $injector.get('$state');
      userService = $injector.get('userService');
      $timeout = $injector.get('$timeout');
      $ionicLoading = $injector.get('$ionicLoading');
      GPS = $injector.get('GPS');
    });

    var createController = function () {
      return $controller('SearchController', {
        $scope : $scope,
        $state : $state,
        GPS : GPS,
        $ionicLoading : $ionicLoading,
        $timeout : $timeout,
        userService : userService
      });
    };
    vm = createController();
  });

  it('SearchController should exist', function () {
    assert.isDefined(vm, 'vm is defined');
  });
});
