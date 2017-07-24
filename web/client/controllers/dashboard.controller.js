(function (){
    "use strict";

    angular.module('nodeApp')
            .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$rootScope', '$firebaseObject', '$timeout']

    function DashboardController($scope, $rootScope, $firebaseObject, $timeout){

        var vm = this;
        vm.message = "Dashboard";
        vm.monitoring_questions = [];
        function getInformation(){
            var ref = firebase.database().ref('/').child('monitoring');
            var promise = ref.once('value').then(function (snapshot) {
                var obj = snapshot.val();
                for (var i in obj) {
                    vm.monitoring_questions.push(obj[i]);
                }
                return;
            }) 
            return promise;
        }
        getInformation().then(function (){
            $scope.$apply()
        })
        $timeout(function(){}, 3000);
        //Getting Firabse Data


        
    }
})();