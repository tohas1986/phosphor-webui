/**
 * Controller for SMTP
 *
 * @module app/configuration
 * @exports smtpController
 * @name smtpController
 */

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
    'toastService', 'Constants',
    function(
        $scope, $window, APIUtils, dataService, $timeout, $route, $q,
        toastService, Constants) {

      $scope.dataService = dataService;
      $scope.cofirmSettings = false;


      $scope.$log = $log;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.selectedSeverity =
          {all: true, normal: false, warning: false, critical: false};
      $scope.export_name = 'smtp.json';

      $scope.loading = false;
      $scope.jsonData = function(data) {
        var dt = {};
        data.data.forEach(function(item) {
          dt[item.original_data.key] = item.original_data.value;
        });
        return JSON.stringify(dt);
      };

      $scope.setSMTPMode = function(){
            $scope.smtpmode=document.getElementById("smtpmode").value;
            return APIUtils.setSMTPMode($scope.smtpmode)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  return $q.reject();
                });
      };

      //$scope.setSMTPMode = function(){
      //      $scope.smtpmode=document.getElementById("smtpmode").value;
      //      $scope.smtpperiod=document.getElementById("smtpperiod").value;
      //      $scope.smtprecipient=document.getElementById("smtprecipient").value;
      //      return APIUtils.setSMTPMode($scope.smtpmode,$scope.smtpperiod,$scope.smtprecipient)
      //      .then(
      //          function(data) {},
      //          function(error) {
      //            console.log(JSON.stringify(error));
      //            return $q.reject();
      //          });
      //};

      function loadSMTPData() {
        return APIUtils.getAllSMTPStatus().then(
                function(data) {
                 document.querySelector('#smtpmode [value="' + data.data + '"]').setAttribute('selected', 'selected'); },
                function(error) {
                  console.log(JSON.stringify(error));
                  return $q.reject();
                });
      };

      $scope.clear = function() {
        $scope.customSearch = '';
        $scope.searchTerms = [];
      };

      $scope.doSearchOnEnter = function(event) {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (event.keyCode === 13 && search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.doSearchOnClick = function() {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.toggleSeverityAll = function() {
        $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

        if ($scope.selectedSeverity.all) {
          $scope.selectedSeverity.normal = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        }
      };

      $scope.toggleSeverity = function(severity) {
        $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

        if (['normal', 'warning', 'critical'].indexOf(severity) > -1) {
          if ($scope.selectedSeverity[severity] == false &&
              (!$scope.selectedSeverity.normal &&
               !$scope.selectedSeverity.warning &&
               !$scope.selectedSeverity.critical)) {
            $scope.selectedSeverity.all = true;
            return;
          }
        }

        if ($scope.selectedSeverity.normal && $scope.selectedSeverity.warning &&
            $scope.selectedSeverity.critical) {
          $scope.selectedSeverity.all = true;
          $scope.selectedSeverity.normal = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        } else {
          $scope.selectedSeverity.all = false;
        }
      };

      $scope.filterBySeverity = function(smtp) {
        if ($scope.selectedSeverity.all) return true;

        return (
            (smtp.severity_flags.normal && $scope.selectedSeverity.normal) ||
            (smtp.severity_flags.warning &&
             $scope.selectedSeverity.warning) ||
            (smtp.severity_flags.critical &&
             $scope.selectedSeverity.critical));
      };

      $scope.filterBySearchTerms = function(smtp) {
        if (!$scope.searchTerms.length) return true;

        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          if (smtp.search_text.indexOf($scope.searchTerms[i].toLowerCase()) ==
              -1)
            return false;
        }
        return true;
      };

	loadSMTPData();

      // Получить SMTP-настройки с сервера
      //getSMTPSettings();

      // Сохранить изменения
      //$scope.setSMTPSettings = function() {
      //};

      // В случае обновления страницы
      //$scope.refresh = function() {
      //};

      // Получение настроек с сервера
      //function getSMTPSettings() {
      //}

      // Присвоение полей через объект $scope
      //function setFields(data){
      //}
    }
  ]);
})(angular);
