/**
 * A module for the login
 *
 * @module app/login/index
 * @exports app/login/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.login', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider.when('/login', {
	    title: 'Авторизация',
	    title_en: 'Login',
            'template': require('./controllers/login-controller.html'),
            'controller': 'LoginController',
            authenticated: false
          });
        }
      ]);
})(window.angular);
