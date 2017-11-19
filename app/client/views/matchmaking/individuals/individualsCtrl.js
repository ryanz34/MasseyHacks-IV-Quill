angular.module('reg')
.controller('IndividualsCtrl', [
  '$scope',
  '$stateParams',
  'currentUser',
  'settings',
  'Utils',
  'UserService',
  'TEAM',
  'Session',
  function($scope, $stateParams, currentUser, settings, Utils, UserService, TEAM, Session){

    //icon tooltip popup
    $('.icon')
    .popup({
      on: 'hover'
    });
    // Get the current user's most recent data.
    var Settings = settings.data;

    $scope.user = currentUser.data;
    $scope.pages = [];
    $scope.users = [];

    //Update table data
    function updateTable(data){
      $scope.users = data.users.filter(function(user){
        return user.id !== $scope.user.id;
      });
      $scope.currentPage = data.page;
      $scope.pageSize = data.size;

      var p = [];
      for (var i = 0; i < data.totalPages; i++){
        p.push(i);
      }
      $scope.pages = p;
    }
    function getMatchmakingData(){
      UserService
      .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
      .success(function(data){
        updateTable(data);
      })
    }
    $scope.filterMatchmaking = function() {
      UserService
        .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
        .success(function(data){
          updateTable(data);
        });
    }

    getMatchmakingData();


  }]);
