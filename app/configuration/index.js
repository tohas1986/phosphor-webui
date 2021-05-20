/**
 * A module for the configuration
 *
 * @module app/configuration/index
 * @exports app/configuration/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.configuration', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/configuration/network', {
                title: 'Сеть',
                title_en: 'Network',
                'template': require('./controllers/network-controller.html'),
                'controller': 'networkController',
                authenticated: true
              })
              .when('/configuration/date-time', {
                title: 'Дата и время',
                title_en: 'Date Settings',
                'template': require('./controllers/date-time-controller.html'),
                'controller': 'dateTimeController',
                authenticated: true
              })
              .when('/configuration', {
                title: 'Сеть',
                title_en: 'Network',
                'template': require('./controllers/network-controller.html'),
                'controller': 'networkController',
                authenticated: true
              })
              .when('/configuration/snmp', {
                title: 'Почта - SNMP',
                title_en: 'SNMP',
                'template': require('./controllers/snmp-controller.html'),
                'controller': 'snmpController',
                authenticated: true
              })
              .when('/configuration/firmware', {
                title: 'Прошивка',
                title_en: 'Firmware',
                'template': require('./controllers/firmware-controller.html'),
                'controller': 'firmwareController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
