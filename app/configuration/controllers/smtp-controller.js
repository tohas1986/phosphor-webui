/**
 * Controller for SMTP
 *
 * @module app/configuration
 * @exports smtpController
 * @name smtpController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('smtpController', [
    '$scope', '$window', 'APIUtils', 'dataService', '$timeout', '$route', '$q',
    'toastService',
    function(
        $scope, $window, APIUtils, dataService, $timeout, $route, $q,
        toastService) {

      $scope.dataService = dataService;

      // Начальные значения полей
      setFields({ "email":'',
	    "event1":false,
	    "event2":false,
	    "event3":false,
	    "event4":false,
	    "event5":false,
	    "event6":false,
	    "event7":false,
	    "event8":false
      });

      // Получить SMTP-настройки с сервера
      getSMTPSettings();

      // Сохранить изменения
      $scope.setSMTPSettings = function() {
        APIUtils.setSMTPSettings({ "email":$scope.email,
	    "event1":$scope.event1,
	    "event2":$scope.event2,
	    "event3":$scope.event3,
	    "event4":$scope.event4,
	    "event5":$scope.event5,
	    "event6":$scope.event6,
	    "event7":$scope.event7,
	    "event8":$scope.event8
	}).then(function(data) {
          dataService.setSMTPSettings(data);
          setFields(data); // Получить подтвержденные изменения и переписать поля
	});
      };

      // В случае обновления страницы
      $scope.refresh = function() {
        getSMTPSettings();
      };

      // Получение настроек с сервера
      function getSMTPSettings() {
        APIUtils.getSMTPSettings().then(function(data) {
          dataService.setSMTPSettings(data);
          setFields(data);
	});
      }

      // Присвоение полей через объект $scope
      function setFields(data){
	for(const [key, value] of Object.entries(data))
	    $scope[key]=value;
      }


    }
  ]);
})(angular);
