(function(){

   "use strict";
   angular.module('nodeApp')
      .controller('BuilderController', BuilderController);
   BuilderController.$inject = ['$scope', '$firebaseObject', '$firebaseArray'];
//,'$location','$routeParams', 
   function BuilderController($scope, $firebaseObject, $firebaseArray){
//, $location, $routeParams
      var vm = this;
      var surveyName = "";
      var surveyType = "";
      var numQuestions = 0;
      $scope.initialized = false;
      $scope.finished = false;
      $scope.qNum = [];
      $scope.options = [
         "yes or no", 
         "frequency", 
         "number",
         "free response"];
      $scope.questionsArray = [];

      $scope.saveGeneralInfo = function() {
         surveyName = $scope.surveyName;
         surveyType = $scope.surveyType;
         numQuestions = $scope.numQuestions;

         console.log(surveyName);
         console.log(surveyType);
         console.log(numQuestions);

         $scope.initialized = true;

         // $scope.surveyName = "";
         // $scope.surveyType = "";
         // $scope.numQuestions = "";        
      }

      $scope.iterate = function() {
         
         if ($scope.initialized) {
            for (var i = 1; i < $scope.numQuestions + 1; i++){
               $scope.qNum.push(i);
            }
            console.log($scope.qNum);
         }
      }


      $scope.saveQandA = function() {
         console.log($scope.questionsArray);

         $scope.questionsArray = [];
         $scope.finished = true;
      }

      $scope.postToFB = function() {
         var fb = firebase.database().ref('/New Surveys');         

         fb.push({
            name: surveyName, 
            surveyType: surveyType, 
            numQuestions: numQuestions,
            questions: $scope.questionsArray
         }).then(function(ref) {
            console.log(ref);
         }, function(error) {
            console.log("Error:", error);
         });
      }
   }

})();