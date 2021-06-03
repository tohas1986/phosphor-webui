/**
 * Controller for server LED
 *
 * @module app/serverControl
 * @exports serverLEDController
 * @name serverLEDController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('serverLEDController', [
    '$scope', '$window', '$route', 'APIUtils', 'dataService', 'toastService',
    '$location',
    function(
        $scope, $window, $route, APIUtils, dataService, toastService,
        $location) {
      $scope.dataService = dataService;

      APIUtils.getLEDState().then(function(state) {
        $scope.displayLEDState(state);
      });

      $scope.displayLEDState = function(state) {
        if (state == APIUtils.LED_STATE_TEXT.on) {
          dataService.LED_state = APIUtils.LED_STATE.on;
        } else {
          dataService.LED_state = APIUtils.LED_STATE.off;
        }
      };

      $scope.toggleLED = function() {
        var toggleState = (dataService.LED_state == APIUtils.LED_STATE.on) ?
            APIUtils.LED_STATE.off :
            APIUtils.LED_STATE.on;
        dataService.LED_state =
            (dataService.LED_state == APIUtils.LED_STATE.on) ?
            APIUtils.LED_STATE.off :
            APIUtils.LED_STATE.on;

        APIUtils.setLEDState(toggleState)
            .then(
                function(response) {},
                function(errors) {
                  toastService.error( (dataService.language == 'ru')
? 'Не удалось переключить светодионый индикатор в состояние ' + (toggleState ? '<включен>' : '<выключен>')
: 'Failed to turn LED light ' + (toggleState ? 'on' : 'off')
		  );
                  console.log(JSON.stringify(errors));
                  // Reload to get correct current LED state
                  $route.reload();
                })
      };
    }
  ]);
})(angular);
