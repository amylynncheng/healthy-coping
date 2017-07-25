// (function () {
//     "use strict";
//      angular.module('nodeApp', ['ngRoute', 'firebase', 'LocalStorageModule'])
//             .config(config);

//     config.$inject = ['$routeProvider', 'localStorageServiceProvider'];

//     function config($routeProvider, localStorageServiceProvider){
//         $routeProvider
//             .when('/home', {
//                 title: 'Diabetes Assistant',
//                 controller: 'mainController',
//                 templateUrl: './views/home.html',
//                 //css: '../css/style.css',
//                 controllerAs: 'vm'
//             })
//             .when('/builder', {
//                 title: 'Survey Builder',
//                 controller: 'BuilderController',
//                 templateUrl: './views/builder.html',
//                 controllerAs: 'vm' 
//             })
//             .when('/dashboard', {
//                 title: 'Dashboard',
//                 controller: 'DashboardController',
//                 templateUrl: './views/dashboard.html',
//                 controllerAs: 'vm' 
//             })
//             .otherwise({ redirectTo: '/home' })
//     }
// });

var nodeApp = angular.module('nodeApp', ['ngRoute', 'firebase', 'ngMaterial']);

nodeApp.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        .when('/', {
            title: 'Diabetes Assistant',
            templateUrl: './views/home.html',
            css: './css/style.css',
            controller: 'mainController',
            controllerAs: 'mc'
        })
        .when('/builder', {
            title: 'Survey Builder',
            controller: 'BuilderController',
            css: './css/style.css',
            templateUrl: './views/builder.html',
            controllerAs: 'vm' 
        })
        .when('/visuals', {
            title: 'Visualized Results',
            controller: 'VisualsController',
            css: './css/style.css',
            templateUrl: './views/visuals.html',
            controllerAs: 'vm' 
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

