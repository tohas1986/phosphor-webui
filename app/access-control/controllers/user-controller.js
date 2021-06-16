/**
 * Controller for user Accounts
 *
 * @module app/access-control
 * @exports userController
 * @name userController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.accessControl').controller('userController', [
    '$scope', 'APIUtils', 'toastService', 'Constants', '$uibModal', '$q', 'dataService',
    function($scope, APIUtils, toastService, Constants, $uibModal, $q, dataService) {
      $scope.dataService = dataService;
      $scope.loading;
      $scope.accountSettings;
      $scope.userRoles;
      $scope.localUsers;
      $scope.removeUserAccessRole = Constants.RESTRICTED_USER_ACCESS_ROLE;

      $scope.tableData = [];
      $scope.tableHeader = ( dataService.language == 'ru' )
	? [{label: 'Имя пользователя'}, {label: 'Привилегии'}, {label: 'Статус учетной записи'}]
	: [{label: 'Username'}, {label: 'Privilege'}, {label: 'Account status'}];
      $scope.tableBatchActions =  ( dataService.language == 'ru' )
? [{type: 'delete', label: 'Удалить'},{type: 'enable', label: 'Увключить'},{type: 'disable', label: 'Отключить'},]
: [{type: 'delete', label: 'Remove'}, {type: 'enable', label: 'Enable'},   {type: 'disable', label: 'Disable'},];

      /**
       * Returns true if username is 'root'
       * @param {*} user
       */
      function checkIfRoot(user) {
        return user.UserName === 'root' ? true : false;
      }

      /**
       * Data table mapper
       * @param {*} user
       * @returns user
       */
      function mapTableData(user) {
        const accountStatus =
            user.Locked ? 'Locked' : user.Enabled ? 'Enabled' : 'Disabled';
        const editAction = {type: 'Edit', enabled: true, file: 'icon-edit.svg'};
        const deleteAction = {
          type: 'Delete',
          enabled: checkIfRoot(user) ? false : true,
          file: 'icon-trashcan.svg'
        };
        user.selectable = checkIfRoot(user) ? false : true;
        user.actions = [editAction, deleteAction];
        user.uiData = [user.UserName, user.RoleId, accountStatus];
        return user;
      }

      /**
       * Returns lockout method based on the lockout duration property
       * If the lockoutDuration is greater than 0 the lockout method
       * is automatic otherwise the lockout method is manual
       * @param {number} lockoutDuration
       * @returns {number} : returns the account lockout method
       *                     1(automatic) / 0(manual)
       */
      function mapLockoutMethod(lockoutDuration) {
        return lockoutDuration > 0 ? 1 : 0;
      }

      /**
       * API call to get all user accounts
       */
      function getLocalUsers() {
        $scope.loading = true;
        APIUtils.getAllUserAccounts()
            .then((users) => {
              $scope.localUsers = users;
              $scope.tableData = users.map(mapTableData);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              toastService.error(( dataService.language == 'ru' ) ? 'Не удалось загрузить пользователей':'Failed to load users.');
            })
            .finally(() => {
              $scope.loading = false;
            })
      }

      /**
       * API call to get current Account settings
       */
      function getAccountSettings() {
        APIUtils.getAllUserAccountProperties()
            .then((settings) => {
              $scope.accountSettings = settings;
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              $scope.accountSettings = null;
            })
      }

      /**
       * API call to get local user roles
       */
      function getUserRoles() {
        APIUtils.getAccountServiceRoles()
            .then((roles) => {
              $scope.userRoles = roles;
              // Remove 'No Access' as user role option
              $scope.userRoles.splice(
                  $scope.userRoles.indexOf($scope.removeUserAccessRole), 1);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              $scope.userRoles = null;
            })
      }

      /**
       * API call to create new user
       * @param {*} user
       */
      function createUser(username, password, role, enabled) {
        $scope.loading = true;
        APIUtils.createUser(username, password, role, enabled)
            .then(() => {
              getLocalUsers();
              toastService.success(( dataService.language == 'ru' ) ? `Пользователь '${username}' создан.`:`User '${username}' has been created.`);
            })
            .catch((error) => {
              if (error.data && error.data['Password@Message.ExtendedInfo']) {
                const msg = error.data['Password@Message.ExtendedInfo'][0];
                toastService.error(msg.Message);
              } else {
                toastService.error(( dataService.language == 'ru' ) ? `Не удалось создать нового пользователя '${username}'.`:`Failed to create new user '${username}'.`);
              }
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * API call to update existing user
       */
      function updateUser(
          originalUsername, username, password, role, enabled, locked) {
        $scope.loading = true;
        APIUtils
            .updateUser(
                originalUsername, username, password, role, enabled, locked)
            .then(() => {
              getLocalUsers();
              toastService.success(( dataService.language == 'ru' ) ? 'Пользователь успешно обновлен':'User has been updated successfully.')
            })
            .catch((error) => {
              if (error.data && error.data['Password@Message.ExtendedInfo']) {
                const msg = error.data['Password@Message.ExtendedInfo'][0];
                toastService.error(msg.Message);
              } else {
                toastService.error(( dataService.language == 'ru' ) ? `Невозможно обновить пользователя '${originalUsername}'.`:`Unable to update user '${originalUsername}'.`);
              }
            })
            .finally(() => {
              $scope.loading = false;
            })
      }

      /**
       * API call to delete users
       * @param {*} users : Array of users to delete
       */
      function deleteUsers(users = []) {
        $scope.loading = true;
        const promises =
            users.map((user) => APIUtils.deleteUser(user.UserName));
        $q.all(promises)
            .then(() => {
              let message;
              if (users.length > 1) {
                message = ( dataService.language == 'ru' ) ? 'Пользователи удалены':'Users have been removed.'
              } else {
                message = ( dataService.language == 'ru' ) ? `Пользователь '${users[0].UserName}' удален.`:`User '${users[0].UserName}' has been removed.`
              }
              toastService.success(message);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              let message;
              if (users.length > 1) {
                message = ( dataService.language == 'ru' ) ? 'Не удалось удалить пользователей':'Failed to remove users.'
              } else {
                message = ( dataService.language == 'ru' ) ? `Не удалось удалить пользователя '${users[0].UserName}'.`:`Failed to remove user '${users[0].UserName}'.`
              }
              toastService.error(message);
            })
            .finally(() => {
              getLocalUsers();
              $scope.loading = false;
            });
      }

      /**
       * API call to update user status enabled/disabled
       * @param {*} users : Array of users to update
       * @param {boolean} enabled : status
       */
      function updateUserStatus(users = [], enabled = true) {
        $scope.loading = true;
        const promises = users.map(
            (user) => APIUtils.updateUser(
                user.UserName, null, null, null, enabled, null));
        $q.all(promises)
            .then(() => {
              let message;
              let statusLabel    = enabled ? 'enabled' : 'disabled';
              let statusLabel_ru = enabled ? 'включен' : 'отключен';
              if (users.length > 1) {
                message = ( dataService.language == 'ru' ) ? `Пользователи ${statusLabel_ru}ы.`:`Users ${statusLabel}.`;
              } else {
                message = ( dataService.language == 'ru' ) ? `Пользователь '${users[0].UserName}' ${statusLabel_ru}.`:`User '${users[0].UserName}' ${statusLabel}.`;
              }
              toastService.success(message);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              let message;
              let statusLabel = enabled ? 'enable' : 'disable';
              let statusLabel_ru = enabled ? 'включить' : 'отключить';
              if (users.length > 1) {
                message = ( dataService.language == 'ru' ) ? `Не удалось ${statusLabel_ru} пользователей.`:`Failed to ${statusLabel} users.`;
              } else {
                message = ( dataService.language == 'ru' ) ? `не удалось ${statusLabel_ru} пользователя '${users[0].UserName}'.`:`Failed to ${statusLabel} user '${users[0].UserName}'.`;
              }
              toastService.error(message);
            })
            .finally(() => {
              getLocalUsers();
              $scope.loading = false;
            });
      }

      /**
       * API call to save account policy settings
       * @param {number} lockoutDuration
       * @param {number} lockoutThreshold
       */
      function updateAccountSettings(lockoutDuration, lockoutThreshold) {
        $scope.loading = true;
        APIUtils.saveUserAccountProperties(lockoutDuration, lockoutThreshold)
            .then(() => {
              $scope.accountSettings['AccountLockoutDuration'] =
                  lockoutDuration;
              $scope.accountSettings['AccountLockoutThreshold'] =
                  lockoutThreshold;
              toastService.success(( dataService.language == 'ru' ) ? 'Настройки политики учетной записи обновлены':'Account policy settings have been updated.');
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              toastService.error(( dataService.language == 'ru' ) ? 'Не удалось обновить настройки политики учетной записи':'Failed to update account policy settings.');
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * Initiate account settings modal
       */
      function initAccountSettingsModal() {
        const template = require('./user-accounts-modal-settings.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                const lockoutMethod = mapLockoutMethod(
                    $scope.accountSettings.AccountLockoutDuration);

                this.settings = {};
                this.settings.maxLogin =
                    $scope.accountSettings.AccountLockoutThreshold;
                this.settings.lockoutMethod = lockoutMethod;
                this.settings.timeoutDuration = !lockoutMethod ?
                    null :
                    $scope.accountSettings.AccountLockoutDuration;
              }
            })
            .result
            .then((form) => {
              if (form.$valid) {
                const lockoutDuration = form.lockoutMethod.$modelValue ?
                    form.timeoutDuration.$modelValue :
                    0;
                const lockoutThreshold = form.maxLogin.$modelValue;
                updateAccountSettings(lockoutDuration, lockoutThreshold);
              }
            })
            .catch(
                () => {
                    // do nothing
                })
      }

      /**
       * Initiate user modal
       * Can be triggered by clicking edit in table or 'Add user' button
       * If triggered from the table, user parameter will be provided
       * If triggered by add user button, user parameter will be undefined
       * @optional @param {*} user
       */
      function initUserModal(user) {
        if ($scope.userRoles === null || $scope.userRoles === undefined) {
          // If userRoles failed to load,  do not allow add/edit
          // functionality
          return;
        }
        const newUser = user ? false : true;
        const originalUsername = user ? angular.copy(user.UserName) : null;
        const template = require('./user-accounts-modal-user.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                // Set default status to Enabled
                const status = newUser ? true : user.Enabled;
                // Check if UserName is root
                // Some form controls will be disabled for root users:
                // edit enabled status, edit username, edit role
                const isRoot =
                    newUser ? false : checkIfRoot(user) ? true : false;
                // Array of existing usernames (excluding current user instance)
                const existingUsernames =
                    $scope.localUsers.reduce((acc, val) => {
                      if (user && (val.UserName === user.UserName)) {
                        return acc;
                      }
                      acc.push(val.UserName);
                      return acc;
                    }, []);

                this.user = {};
                this.user.isRoot = isRoot;
                this.user.new = newUser;
                this.user.accountStatus = status;
                this.user.username = newUser ? '' : user.UserName;
                this.user.privilege = newUser ? '' : user.RoleId;
                this.user.locked = newUser ? null : user.Locked;

                this.manualUnlockProperty = false;
                this.automaticLockout = mapLockoutMethod(
                    $scope.accountSettings.AccountLockoutDuration);
                this.privilegeRoles = $scope.userRoles;
                this.existingUsernames = existingUsernames;
                this.minPasswordLength = $scope.accountSettings ?
                    $scope.accountSettings.MinPasswordLength :
                    null;
                this.maxPasswordLength = $scope.accountSettings ?
                    $scope.accountSettings.MaxPasswordLength :
                    null;
              }
            })
            .result
            .then((form) => {
              if (form.$valid) {
                // If form control is pristine set property to null
                // this will make sure only changed values are updated when
                // modifying existing users
                // API utils checks for null values
                const username =
                    form.username.$pristine ? null : form.username.$modelValue;
                const password =
                    form.password.$pristine ? null : form.password.$modelValue;
                const role = form.privilege.$pristine ?
                    null :
                    form.privilege.$modelValue;
                const enabled = (form.accountStatus.$pristine &&
                                 form.accountStatus1.$pristine) ?
                    null :
                    form.accountStatus.$modelValue;
                const locked = (form.lock && form.lock.$dirty) ?
                    form.lock.$modelValue :
                    null;

                if (!newUser) {
                  updateUser(
                      originalUsername, username, password, role, enabled,
                      locked);
                } else {
                  createUser(
                      username, password, role, form.accountStatus.$modelValue);
                }
              }
            })
            .catch(
                (res) => {
                    // do nothing
                })
      }

      /**
       * Intiate remove users modal
       * @param {*} users
       */
      function initRemoveModal(users) {
        const template = require('./user-accounts-modal-remove.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                this.users = users;
              }
            })
            .result
            .then(() => {
              deleteUsers(users);
            })
            .catch(
                () => {
                    // do nothing
                })
      }

      /**
       * Callback when action emitted from table
       * @param {*} value
       */
      $scope.onEmitRowAction = (value) => {
        switch (value.action) {
          case 'Edit':
            initUserModal(value.row);
            break;
          case 'Delete':
            initRemoveModal([value.row]);
            break;
          default:
        }
      };

      /**
       * Callback when batch action emitted from table
       */
      $scope.onEmitBatchAction = (value) => {
        switch (value.action) {
          case 'delete':
            initRemoveModal(value.filteredRows);
            break;
          case 'enable':
            updateUserStatus(value.filteredRows, true)
            break;
          case 'disable':
            updateUserStatus(value.filteredRows, false)
            break;
          default:
            break;
        }
      };

      /**
       * Callback when 'Account settings policy' button clicked
       */
      $scope.onClickAccountSettingsPolicy = () => {
        initAccountSettingsModal();
      };

      /**
       * Callback when 'Add user' button clicked
       */
      $scope.onClickAddUser = () => {
        initUserModal();
      };

      /**
       * Callback when controller view initially loaded
       */
      $scope.$on('$viewContentLoaded', () => {
        getLocalUsers();
        getUserRoles();
        getAccountSettings();
      })
    }
  ]);
})(angular);
