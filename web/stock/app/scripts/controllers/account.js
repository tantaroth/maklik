'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('stockApp')
    .controller('AccountCtrl', function($scope, user, Auth, Ref, $firebaseObject, $timeout, tempData) {
        $scope.logout = function() {
            tempData.set('html', 'views/layouts/public.html');
            Auth.$unauth();
        };

        if (Auth.$getAuth()) {
            var user = $scope.user = Auth.$getAuth(),
                AuthUser = $scope.AuthUser = user[user.provider],
                profile = $firebaseObject(Ref.child('users/' + user.uid)),
                document_types = $scope.document_types = [];

                console.log('A ', user)

            profile.$bindTo($scope, 'profile');

            document_types.push({
                "id": "cc",
                "label": "Cedula de ciudadania"
            });
            document_types.push({
                "id": "pasaporte",
                "label": "Pasaporte"
            });
        } else $scope.logout();

        $scope.changePassword = function(oldPass, newPass, confirm) {
            $scope.err = null;
            if (!oldPass || !newPass) {
                error('Please enter all fields');
            } else if (newPass !== confirm) {
                error('Passwords do not match');
            } else {
                Auth.$changePassword({
                        email: profile.email,
                        oldPassword: oldPass,
                        newPassword: newPass
                    })
                    .then(function() {
                        success('Password changed');
                    }, error);
            }
        };

        $scope.changeEmail = function(pass, newEmail) {
            $scope.err = null;
            Auth.$changeEmail({
                    password: pass,
                    newEmail: newEmail,
                    oldEmail: profile.email
                })
                .then(function() {
                    profile.email = newEmail;
                    profile.$save();
                    success('Email changed');
                })
                .catch(error);
        };

        function error(err) {
            alert(err, 'danger');
        }

        function success(msg) {
            alert(msg, 'success');
        }

        function alert(msg, type) {
            var obj = {
                text: msg + '',
                type: type
            };
            $scope.messages.unshift(obj);
            $timeout(function() {
                $scope.messages.splice($scope.messages.indexOf(obj), 1);
            }, 10000);
        }

    });
