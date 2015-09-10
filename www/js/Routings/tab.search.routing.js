angular.module('starter')
  .config(tabSearch);

tabSearch.$inject = ['$stateProvider'];

function tabSearch($stateProvider){
  // setup an abstract state for the tabs directive
  $stateProvider.state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchController as vm'
      }
    },
    resolve: {
      "currentAuth" : ["Auth",
        function(Auth) {
          return Auth.$requireAuth();
        }
      ]
    }
  })
}
