/**
 * A module for the access control
 *
 * @module app/access-control/index
 * @exports app/access-control/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.accessControl', ['ngRoute', 'app.common.services'])
      // Route access-control
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/access-control', {
                title: 'LDAP',
                title_en: 'LDAP',
                'template': require('./controllers/ldap-controller.html'),
                'controller': 'ldapController',
                authenticated: true
              })
              .when('/access-control/ldap', {
                title: 'LDAP',
                title_en: 'LDAP',
                'template': require('./controllers/ldap-controller.html'),
                'controller': 'ldapController',
                authenticated: true
              })
              .when('/access-control/local-users', {
                title: 'Управление пользователями',
                title_en: 'User Management',
                'template': require('./controllers/user-controller.html'),
                'controller': 'userController',
                authenticated: true
              })
              .when('/access-control/ssl-certificates', {
                title: 'Сертификаты SSL',
                title_en: 'SSL Certificates',
                'template':
                    require('./controllers/certificate-controller.html'),
                'controller': 'certificateController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
