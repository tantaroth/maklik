'use strict';

/**
 * @ngdoc function
 * @name stockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the stockApp
 */
angular.module('stockApp')
    .controller('PublicCtrl', function($scope, tempData, Auth, Ref, localStorageService, $firebaseObject) {
        var tempData_, layout;

        tempData_ = localStorageService.get('tempData') || false;
        tempData.set('html', tempData_.html || 'views/layouts/public.html');
        layout = $scope.layout = tempData.get();
    })
    .controller('AdminCtrl', function($scope, tempData, Auth, Ref, localStorageService, $firebaseObject) {
        var AuthGet = Auth.$getAuth(), AuthUser = $scope.AuthUser = AuthGet[AuthGet.provider],
            profile = $firebaseObject(Ref.child('users/' + AuthGet.uid));

        profile.$bindTo($scope, 'profile');

        AuthUser = AuthGet[AuthGet.provider];

        $scope.logout = function() {
            tempData.set('html', 'views/layouts/public.html');
            Auth.$unauth();
        }
    })
    .factory('tempData', function(localStorageService) {
        var data = localStorageService.get('tempData') || {};

        return {
            get: function() {
                return data;
            },
            set: function(key, value) {
                data[key] = value;
                localStorageService.set('tempData', data);

                return data;
            }
        };
    });
