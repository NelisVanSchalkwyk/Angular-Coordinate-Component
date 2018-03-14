(function () {
    'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.$inject = ['$scope', '$log'];

    function MainController($scope, $log) {
        var vm = this;

        vm.lat = -25.938285;
        vm.lng = 28.193479;

        $scope.$watch(function () { return vm.lat; }, function () {
            $log.debug('lat:' + vm.lat);
        });

        $scope.$watch(function () { return vm.lng; }, function () {
            $log.debug('lng: ' + vm.lng);
        });
    }
})();
