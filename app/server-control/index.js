/**
 * A module for the serverControl
 *
 * @module app/server-control/index
 * @exports app/server-control/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.serverControl', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/server-control/bmc-reboot', {
                title: 'Reboot BMC',
                title_ru: 'Перезагрузить BMC',
                'template': require('./controllers/bmc-reboot-controller.html'),
                'controller': 'bmcRebootController',
                authenticated: true
              })
              .when('/server-control/server-led', {
                title: 'LED Light Control',
                title_ru: 'Управление LED-индикаторами',
                'template': require('./controllers/server-led-controller.html'),
                'controller': 'serverLEDController',
                authenticated: true
              })
              .when('/server-control/power-operations', {
                title: 'Server Power',
                title_ru: 'Питание сервера',
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              })
              .when('/server-control/power-usage', {
                title: 'Power Usage',
                title_ru: 'Потребление энергии',
                'template':
                    require('./controllers/power-usage-controller.html'),
                'controller': 'powerUsageController',
                authenticated: true
              })
              .when('/server-control/remote-console', {
                title: 'Serial over LAN',
                title_ru: 'Удаленная консоль',
                'template':
                    require('./controllers/remote-console-controller.html'),
                authenticated: true
              })
              .when('/server-control/remote-console-window', {
                title: 'Serial over LAN',
                title_ru: 'Удаленна консоль',
                'template': require(
                    './controllers/remote-console-window-controller.html'),
                'controller': 'remoteConsoleWindowController',
                authenticated: true
              })
              .when('/server-control/kvm', {
                title: 'KVM',
                title_ru: 'KVM',
                'template': require('./controllers/kvm-controller.html'),
                'controller': 'kvmController',
                authenticated: true
              })
              .when('/server-control/kvm-window', {
                title: 'KVM',
                title_ru: 'KVM',
                'template': require('./controllers/kvm-window-controller.html'),
                'controller': 'kvmWindowController',
                authenticated: true
              })
              .when('/server-control/virtual-media', {
                title: 'Virtual Media',
                title_ru: 'Виртуальные устройства',
                'template':
                    require('./controllers/virtual-media-controller.html'),
                'controller': 'virtualMediaController',
                authenticated: true,
                redirectTo: function(routeParams, path, search) {
                  var configJSON = require('../../config.json');
                  if (configJSON.VirtualMediaEnabled == true) {
                    return undefined;
                  } else {
                    return '../404.html';
                  }
                }
              })
              .when('/server-control', {
                title: 'Power Operations',
                title_ru: 'Управление питанием',
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
