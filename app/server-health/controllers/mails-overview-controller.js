/**
 * Controller for mails-overview
 *
 * @module app/serverHealth
 * @exports mailsOverviewController
 * @name mailsOverviewController
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.overview').controller('mailsOverviewController', [
      '$scope', '$log', '$window', 'APIUtils', 'dataService', 'Constants', '$q',
      function($scope, $log, $window, APIUtils, dataService, Constants, $q) {
      $scope.dataService = dataService;

      $scope.dropdown_selected = false;

      $scope.$log = $log;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.selectedSeverity =
          {all: true, normal: false, warning: false, critical: false};
      $scope.export_name = 'mails.json';
      $scope.mailloading = true; //false;
      $scope.jsonData = function(data) {
        var dt = {};
        data.data.forEach(function(item) {
          dt[item.original_data.key] = item.original_data.value;
        });
        return JSON.stringify(dt);
      };

      $scope.setMailMode = function(){
	    $scope.mailmode=document.getElementById("mailmode").value;
	    return APIUtils.setMailMode($scope.mailmode)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  return $q.reject();
                });
      };

      function loadMailData() {
        return APIUtils.getAllMailStatus().then(
                function(data) {
                 document.querySelector('#mailmode [value="' + data.data + '"]').setAttribute('selected', 'selected'); $scope.mailloading = false; },
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.mailloading = false;
                  toastService.warning('error getAllMailStatus ' + data);
                  return $q.reject();
                });
      };

      loadMaildata.finally(function() {
        $scope.mailloading = false;
      });

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

      $scope.filterBySeverity = function(mail) {
        if ($scope.selectedSeverity.all) return true;

        return (
            (mail.severity_flags.normal && $scope.selectedSeverity.normal) ||
            (mail.severity_flags.warning &&
             $scope.selectedSeverity.warning) ||
            (mail.severity_flags.critical &&
             $scope.selectedSeverity.critical));
      };
      $scope.filterBySearchTerms = function(mail) {
        if (!$scope.searchTerms.length) return true;

        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          if (mail.search_text.indexOf($scope.searchTerms[i].toLowerCase()) ==
              -1)
            return false;
        }
        return true;
      };

      loadMailData();
      $scope.mailloading = false;

    }
  ]);
})(angular);
