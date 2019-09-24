/**
 * Controller for fans-overview
 *
 * @module app/serverHealth
 * @exports fansOverviewController
 * @name fansOverviewController
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.overview').controller('fansOverviewController', [
    '$scope', '$log', '$window', 'APIUtils', 'dataService', 'Constants',
    function($scope, $log, $window, APIUtils, dataService, Constants) {
      $scope.dataService = dataService;

      $scope.dropdown_selected = false;

      $scope.$log = $log;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.selectedSeverity =
          {all: true, normal: false, warning: false, critical: false};
      $scope.export_name = 'fans.json';
      $scope.loading = false;
      $scope.jsonData = function(data) {
        var dt = {};
        data.data.forEach(function(item) {
          dt[item.original_data.key] = item.original_data.value;
        });
        return JSON.stringify(dt);
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

      $scope.filterBySeverity = function(fan) {
        if ($scope.selectedSeverity.all) return true;

        return (
            (fan.severity_flags.normal && $scope.selectedSeverity.normal) ||
            (fan.severity_flags.warning &&
             $scope.selectedSeverity.warning) ||
            (fan.severity_flags.critical &&
             $scope.selectedSeverity.critical));
      };
      $scope.filterBySearchTerms = function(fan) {
        if (!$scope.searchTerms.length) return true;

        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          if (fan.search_text.indexOf($scope.searchTerms[i].toLowerCase()) ==
              -1)
            return false;
        }
        return true;
      };

      $scope.loadFanData = function() {
        $scope.loading = true;
        APIUtils.getAllFanStatus(function(data, originalData) {
          $scope.data = data;
          $scope.originalData = originalData;
          $scope.export_data = JSON.stringify(originalData);
          $scope.loading = false;
        });
      };

      window.open("http://"+window.location.hostname,"Rikor Fan Utilite v2","resizable=yes,scrollbars=yes,width=100%,height=100%");
    }
  ]);
})(angular);
