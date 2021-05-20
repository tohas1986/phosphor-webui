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
                title: 'Перезагрузить BMC ',
                title_en: 'Reboot BMC ',
                'template': require('./controllers/bmc-reboot-controller.html'),
                'controller': 'bmcRebootController',
                authenticated: true
              })
              .when('/server-control/server-led', {
                title: 'Управление LED-индикаторами',
                title_en: 'LED Light Control',
                'template': require('./controllers/server-led-controller.html'),
                'controller': 'serverLEDController',
                authenticated: true
              })
              .when('/server-control/power-operations', {
                title: 'Питание сервера',
                title_en: 'Server Power',
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              })
              .when('/server-control/power-usage', {
                title: 'Потребление энергии',
                title_en: 'Power Usage',
                'template':
                    require('./controllers/power-usage-controller.html'),
                'controller': 'powerUsageController',
                authenticated: true
              })
              .when('/server-control/remote-console', {
                title: 'Удаленная консоль',
                title_en: 'Serial over LAN',
                'template':
                    require('./controllers/remote-console-controller.html'),
                authenticated: true
              })
              .when('/server-control/remote-console-window', {
                title: 'Удаленна консоль',
                title_en: 'Serial over LAN',
                'template': require(
                    './controllers/remote-console-window-controller.html'),
                'controller': 'remoteConsoleWindowController',
                authenticated: true
              })
              .when('/server-control/kvm', {
                title: 'KVM',
                title_en: 'KVM',
                'template': require('./controllers/kvm-controller.html'),
                'controller': 'kvmController',
                authenticated: true
              })
              .when('/server-control/kvm-window', {
                title: 'KVM',
                title_en: 'KVM',
                'template': require('./controllers/kvm-window-controller.html'),
                'controller': 'kvmWindowController',
                authenticated: true
              })
              .when('/server-control/virtual-media', {
                title: 'Виртуальные устройства',
                title_en: 'Virtual Media',
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
                title: 'Управление питанием',
                title_en: 'Power Operations',
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
