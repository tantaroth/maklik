'use strict';

/**
 * @ngdoc function
 * @name stockApp.controller:CompanyCtrl
 * @description
 * # CompanyCtrl
 * Controller of the stockApp
 */
angular.module('stockApp')
    .controller('CompanyCtrl', function($scope, Auth, Ref, tempData, $firebaseObject, $firebaseArray) {
        var form = $scope.form = {},
            companies = $scope.companies = $firebaseArray(Ref.child('companies'));

        if (Auth.$getAuth()) {
            var user = $scope.user = Auth.$getAuth(),
                AuthUser = $scope.AuthUser = user[user.provider],
                document_types = $scope.document_types = [];

            document_types.push({
                "id": "nit",
                "label": "NIT"
            });
        } else $scope.logout();

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + '-' + s4() + s4();
        }

        $scope.create = function() {
            companies.$add(form).then(function(ref) {
            	console.log('andres'.toString().hex2a());
            	return false;
                var id = ref.key(),
                    profile = $firebaseArray(Ref.child('users/' + user.uid + '/companies')),
                    company = $firebaseObject(Ref.child('companies/' + id));

                company.$bindTo($scope, 'company');

                profile.$add({
                    'id': id,
                    'code': guid()
                });
            });
        }
    });
