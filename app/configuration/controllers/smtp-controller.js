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
    '$scope', '$window', 'APIUtils', '$route', '$q', 'toastService',
    function($scope, $window, APIUtils, $route, $q, toastService) {
      $scope.managers = [];
      $scope.loading = true;
      $scope.managersToDelete = [];
      $scope.editSMTPSettings = false;

      var getSMTPStatus = APIUtils.getSMTPStatus().then(
          function(data) {
            // Convert to array of objects from an object of objects, easier
            // to manipulate (e.g. add/remove). Convert key to a path property.
            toastService.warning('Loading SMTP settings... ' + data.data);
            for (var key in data.data) {
              toastService.warning('key ' + key);
              $scope.managers.push({
                path: key,
                period: data.data[key].Period,
                updatePeriod: false,
                mode: data.data[key].Mode,
                updateMode: false,
                recipient: data.data[key].Recipient,
                updateRecipient: false
              })
            }
          },
          function(error) {
            toastService.error('Unable to load SMTP settings. ' + data.data);
            toastService.error('scope. ' + scope.managers);
            console.log(JSON.stringify(error));
          });

      //function loadMailData() {
      //  return APIUtils.getAllMailStatus().then(
      //          function(data) {
      //           document.querySelector('#mailmode [value="' + data.data + '"]').setAttribute('selected', 'selected'); },
      //          function(error) {
      //            console.log(JSON.stringify(error));
      //            return $q.reject();
      //          });
      //};

      getSMTPStatus.finally(function() {
        $scope.loading = false;
      });

      $scope.addNewSMTPManager = function() {
        $scope.managers.push({recipient: '', period: '', mode: ''});
      };

      $scope.removeSMTPManager = function(index) {
        // If the SMTP Manager has a path it exists on the backend and we
        // need to make a call to remove it
        if ($scope.managers[index].path) {
          $scope.managersToDelete.push($scope.managers[index].path);
        }
        $scope.managers.splice(index, 1);
      };

      $scope.updatedRow = function() {
        $scope.rowUpdate = true;
      };

      $scope.refresh = function() {
        $route.reload();
      };

      $scope.setSMTP = function() {
        $scope.loading = true;
        var promises = [];

        // Validate that no field are empty and period/mode is valid. Period/mode value is
        // undefined if it is an invalid number.
        for (let i in $scope.managers) {
          if (!$scope.managers[i].recipient || !$scope.managers[i].period || !$scope.managers[i].mode) {
            $scope.loading = false;
            toastService.error('Cannot save. Please resolve errors on page.' + scope.managers);
            return;
          }
        }
        // Iterate in reverse so can splice
        // https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
        let managersLength = $scope.managers.length;
        while (managersLength--) {
          // If the manager does not have a 'path', it is a new manager
          // and needs to be created
          if (!$scope.managers[managersLength].path) {
            promises.push(addManager(
                $scope.managers[managersLength].recipient,
                $scope.managers[managersLength].period,
                $scope.managers[managersLength].mode));
          } else {
            if ($scope.managers[managersLength].updateRecipient) {
              promises.push(setManagerRecipient(
                  $scope.managers[managersLength].path,
                  $scope.managers[managersLength].recipient));
            }
            if ($scope.managers[managersLength].updatePeriod) {
              promises.push(setManagerPeriod(
                  $scope.managers[managersLength].path,
                  $scope.managers[managersLength].period));
            }
            if ($scope.managers[managersLength].updateMode) {
              promises.push(setManagerMode(
                  $scope.managers[managersLength].path,
                  $scope.managers[managersLength].mode));
            }
          }
        }

        // Add delete promises last since we might be adding to
        // managersToDelete above
        for (let i in $scope.managersToDelete) {
          promises.push(deleteManager($scope.managersToDelete[i]));
        }

        $q.all(promises)
            .then(
                function() {
                  $scope.refresh();
                  $scope.editSMTPSettings = true;
                  toastService.success('SMTP settings have been saved!!! ');
                },
                function(errors) {
                  toastService.error('Unable to set SMTP Managers. ' + promises);
                  console.log(JSON.stringify(errors));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      function addManager(recipient, period, mode) {
        return APIUtils.addSMTPManager(recipient, period, mode);
      }

      function deleteManager(path) {
        return APIUtils.deleteObject(path);
      }

      function setManagerRecipient(path, recipient) {
        return APIUtils.setSMTPManagerRecipient(path, recipient);
      }

      function setManagerPeriod(path, period) {
        return APIUtils.setSMTPManagerPeriod(path, period);
      }

      function setManagerMode(path, mode) {
        return APIUtils.setSMTPManagerMode(path, mode);
      }
    }
  ]);
})(angular);
