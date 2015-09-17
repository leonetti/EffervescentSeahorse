describe("Test search Controller", function() {
  var $scope, $state, GPS, $ionicLoading, $timeout, userService, vm;

  beforeEach(function (done) {

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

    var createController = new Promise(function(resolve, reject) {
        GPS.getGeo = sinon.stub()
          .returns(
          new Promise(function (resolve, reject) {
            resolve({
              'coords': {
                'latitude': 1,
                'longitude': 1
              }
            })
          })
        );
        resolve( $controller('SearchController', {
          $scope: $scope,
          $state: $state,
          GPS: GPS,
          $ionicLoading: $ionicLoading,
          $timeout: $timeout,
          userService: userService
        }));
    });

    createController.then(function(controller){
      vm = controller;
      $scope.$emit('$ionicView.enter');
      done();
    });
  });
  describe("Properties existence", function() {
    it('vm should exist', function () {
      assert.isDefined(vm, 'vm is defined');
    });
    it('vm.users should exist', function () {
      assert.isDefined(vm.users, 'vm.users is defined');
    });
    it('vm.users should be an array', function () {
      assert.equal(Array.isArray(vm.users), true, 'vm.users must be an array');
    });
    it('vm.sendToProfile should exist', function () {
      assert.isDefined(vm.sendToProfile, 'vm.sendToProfile is defined');
    });
    it('vm.users should be an array', function () {
      assert.typeOf(vm.sendToProfile, 'function', 'vm.sendToProfile is a string');
    });
    it('vm.position should exist', function () {
      assert.isDefined(vm.position, 'vm.position is defined');
    });
    it('vm.position should exist', function () {
      assert.deepEqual(vm.position, {'coords': {
        'latitude': 1,
        'longitude': 1
      }}, 'vm.position is correctly assigned');
    });
  });
});
