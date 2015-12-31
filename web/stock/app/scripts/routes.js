'use strict';
/**
 * @ngdoc overview
 * @name stockApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes using `yo angularfire:route` with the optional --auth-required flag.
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['Auth', function(Auth) {
 *       return Auth.$getAuth();
 *     }]
 *   }
 *
 */
angular.module('stockApp')

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes Auth.$requireAuth() service (see Auth.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */
.config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $routeProvider.whenAuthenticated = function(path, route) {
        route.resolve = route.resolve || {};
        route.resolve.user = ['Auth', function(Auth) {
            return Auth.$requireAuth();
        }];
        $routeProvider.when(path, route);
        SECURED_ROUTES[path] = true;
        return $routeProvider;
    };
}])

// configure views; whenAuthenticated adds a resolve method to ensure users authenticate
// before trying to access that route
.config(['$routeProvider', 'localStorageServiceProvider', function($routeProvider, localStorageServiceProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            controller: 'ChatCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .whenAuthenticated('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .whenAuthenticated('/account', {
            templateUrl: 'views/account.html',
            controller: 'AccountCtrl'
        })
        .whenAuthenticated('/company', {
            templateUrl: 'views/company.html',
            controller: 'CompanyCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    localStorageServiceProvider.setPrefix('stock');
}])

/**
 * Apply some route security. Any route's resolve method can reject the promise with
 * "AUTH_REQUIRED" to force a redirect. This method enforces that and also watches
 * for changes in auth status which might require us to navigate away from a path
 * that we can no longer view.
 */
//https://auth.firebase.com/v2/stock-mk/auth/facebook/callback
.run(['$rootScope', '$location', 'Auth', 'tempData', 'SECURED_ROUTES', 'loginRedirectPath',
    function($rootScope, $location, Auth, tempData, SECURED_ROUTES, loginRedirectPath) {
        // watch for login status changes and redirect if appropriate
        Auth.$onAuth(check);

        $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
            if (Auth.$getAuth()) {
                if ($location.path() === '/dashboard') {
                    if (!Auth.$getAuth()) {
                        tempData.set('html', 'views/layouts/public.html');
                        $location.path('/');
                    }
                } else
                if ($location.path() === '/login') {
                    tempData.set('html', 'views/layouts/public.html');
                    $location.path('/account');
                } else
                if ($location.path() === '/') {
                    if (Auth.$getAuth()) {
                        tempData.set('html', 'views/layouts/admin.html');
                        $location.path('/dashboard');
                    } else tempData.set('html', 'views/layouts/public.html');
                } else tempData.set('html', 'views/layouts/admin.html');
            } else {
                tempData.set('html', 'views/layouts/public.html');
            }
        });
        // some of our routes may reject resolve promises with the special {authRequired: true} error
        // this redirects to the login page whenever that is encountered
        $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
            if (err === 'AUTH_REQUIRED') {
                $location.path(loginRedirectPath);
            }
        });

        function check(user) {
            if (!user && authRequired($location.path())) {
                $location.path(loginRedirectPath);
            }
        }

        function authRequired(path) {
            return SECURED_ROUTES.hasOwnProperty(path);
        }
    }
])

// used by route security
.constant('SECURED_ROUTES', {});
