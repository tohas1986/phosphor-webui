window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('confirm', [
    '$timeout',
    function($timeout) {
      return {
        'restrict': 'E',
        'template': require('./confirm.html'),
        'scope':
            {'title': '@', 'message': '@', 'confirm': '=', 'callback': '='},
        'controller': [
          '$scope', 'dataService',
          function($scope, dataService) {
	    $scope.dataService = dataService;
            $scope.cancel = function() {
              $scope.confirm = false;
              $scope.$parent.confirm = false;
              $scope.$parent.confirmReboot = false;
              $scope.$parent.confirmShutdown = false;
            };
            $scope.accept = function() {
              $scope.callback();
              $scope.cancel();
            };
          }
        ]
      };
    }
  ]);
})(window.angular);
