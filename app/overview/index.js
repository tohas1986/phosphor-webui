/**
 * A module for the overview
 *
 * @module app/overview/index
 * @exports app/overview/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.overview', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/overview/server', {
                title: 'Обзор',
                title_en: 'Overview',
                'template':
                    require('./controllers/system-overview-controller.html'),
                'controller': 'systemOverviewController',
                authenticated: true
              })
              .when('/overview', {
                title: 'Обзор',
                title_en: 'Overview',
                'template':
                    require('./controllers/system-overview-controller.html'),
                'controller': 'systemOverviewController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
