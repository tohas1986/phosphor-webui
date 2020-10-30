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
      setFields(['email@box.com',false,true,false,true,false,true,false,true]);

      // Получить SMTP-настройки с сервера
      getSMTPSettings();

      // Сохранить изменения
      $scope.setSMTPSettings = function() {
        APIUtils.setSMTPSettings([$scope.email,
	    $scope.event1,
	    $scope.event2,
	    $scope.event3,
	    $scope.event4,
	    $scope.event5,
	    $scope.event6,
	    $scope.event7,
	    $scope.event8
	]).then(function(data) {
          //dataService.setSMTPSettings(data);
          setFields(data.data); // Получить подтвержденные изменения и переписать поля
	});
      };

      // В случае обновления страницы
      $scope.refresh = function() {
        getSMTPSettings();
      };

      // Получение настроек с сервера
      function getSMTPSettings() {
        APIUtils.getSMTPSettings().then(function(data) {
          //dataService.setSMTPSettings(data);
          setFields(data);
	});
      }

      // Присвоение полей через объект $scope
      function setFields(data){
	$scope.email=data[0];
	$scope.event1=data[1];
	$scope.event2=data[2];
	$scope.event3=data[3];
	$scope.event4=data[4];
	$scope.event5=data[5];
	$scope.event6=data[6];
	$scope.event7=data[7];
	$scope.event8=data[8];
	//for(const [key, value] of Object.entries(data))
	//    $scope[key]=value;
      }


    }
  ]);
})(angular);
