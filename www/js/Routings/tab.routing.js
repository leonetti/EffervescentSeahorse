angular.module('starter')
  .config(tab);

tab.$inject = ['$stateProvider'];

function tab($stateProvider){
  // setup an abstract state for the tabs directive
  $stateProvider.state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
      "currentAuth" : ["Auth",
        function(Auth) {
          return Auth.$requireAuth();
        }
      ]
    }
  })
}
