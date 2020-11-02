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
	setFields([
	    dataService.email,
	    dataService.smtp_event1,
	    dataService.smtp_event2,
	    dataService.smtp_event3,
	    dataService.smtp_event4,
	    dataService.smtp_event5,
	    dataService.smtp_event6,
	    dataService.smtp_event7,
	    dataService.smtp_event8
	]);

      // Получить SMTP-настройки с сервера
      getSMTPSettings();

      // Сохранить изменения
      $scope.setSMTPSettings = function() {
	    dataService.email=$scope.email;    
            APIUtils.setSMTPSettings([
		dataService.email,
		dataService.smtp_event1,
		dataService.smtp_event2,
		dataService.smtp_event3,
		dataService.smtp_event4,
		dataService.smtp_event5,
		dataService.smtp_event6,
		dataService.smtp_event7,
		dataService.smtp_event8
	    ]).then(function(data) {
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
	$scope.email=data[0];
	$scope.smtp_event1=data[1];
	$scope.smtp_event2=data[2];
	$scope.smtp_event3=data[3];
	$scope.smtp_event4=data[4];
	$scope.smtp_event5=data[5];
	$scope.smtp_event6=data[6];
	$scope.smtp_event7=data[7];
	$scope.smtp_event8=data[8];
      }
    }
  ]);
})(angular);
