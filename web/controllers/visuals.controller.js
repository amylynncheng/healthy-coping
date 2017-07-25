(function (){
    "use strict";

    angular.module('nodeApp')
        .controller('VisualsController', VisualsController);

    VisualsController.$inject = ['$scope', '$rootScope', '$firebaseObject', '$firebaseArray']

    function VisualsController($scope, $rootScope, $firebaseObject){
    	$scope.gotData = false;
        $scope.timestamps = [];
        $scope.copeTimestamps = [];
        $scope.dates = [];
        $scope.copeDates = [];

        $scope.monitoringAnswers = []; 
        $scope.glucoseData = [];
        $scope.exerciseData = [];
        $scope.weightData = [];

        $scope.copingAnswers = [];
        $scope.interest = [];
        $scope.down = [];
        $scope.sleep = [];
        $scope.energy = [];
        $scope.appetite = [];
        $scope.negative = [];
        $scope.concentrate = [];
        $scope.movement = [];
        $scope.dead = [];
        $scope.coping = false;

        $scope.loaded = false;
        $scope.timeSelected = '';


        $scope.getMonitoringData = function() {
		    var ref = firebase.database().ref("/").child('monitoringAnswers/patient1');
		    var afterMonitoring = ref.once('value').then(function (snapshot) {
		        var obj = snapshot.val();
		        for (var i in obj) {
		            $scope.monitoringAnswers.push(obj[i]);
		        }
		        console.log($scope.monitoringAnswers);

		        for (var i = 0; i < $scope.monitoringAnswers.length; i++) {
					$scope.glucoseData.push(parseFloat($scope.monitoringAnswers[i].glucose)); 
					$scope.exerciseData.push(parseInt($scope.monitoringAnswers[i].exercise));
					$scope.weightData.push(parseFloat($scope.monitoringAnswers[i].weight));
				}
				for (var j = 0; j < $scope.monitoringAnswers.length; j++) {
					$scope.timestamps.push($scope.monitoringAnswers[j].timestamp); 
				} 
				
				for (var k = 0;  k < $scope.timestamps.length; k++) {
					var date = $scope.timestamps[k];
					var T = date.indexOf("T");
					var d = date.substring(0, T);
					$scope.dates[k] = d;		
				}

				console.log($scope.glucoseData);
				console.log($scope.exerciseData);
				console.log($scope.weightData);	
				// //////DATES
				// console.log($scope.timestamps);
				// console.log($scope.dates);
				$scope.gotData = true;
		    })	        
		}

        $scope.generateGlucoseGraph = function() { 
            var monitorGraph = Highcharts.chart('container', {
                chart: {
			        type: 'line'
			    },
			    title: {
			        text: 'Daily Blood Glucose Readings'
			    },
			    subtitle: {
			        text: 'Source: Healthy Coping App for the Google Home'
			    },
			    xAxis: {
			        categories: $scope.dates
			    },
			    yAxis: {
			        title: {
			            text: 'Blood Glucose (mmol/L)'
			        },
		            plotBands: [{
		                from: 8.5,
		                to: 15,
		                color: 'rgba(255, 0, 0, 0.15)',
		                label: {
		                    text: 'High'
		                } 
		            },
		            {
		            	from: 4,
		                to: 8.5,
		                color: 'rgba(0, 255, 0, 0.15)',
		                label: {
		                    text: 'Normal'
		                }
		            }]
		        },
			    plotOptions: {
			        line: {
			            dataLabels: {
			                enabled: true
			            },
			            enableMouseTracking: false
			        }
			    },
			    series: [{
			        name: 'patient1',
			        data: $scope.glucoseData
			    }]
            }); 
        	$scope.coping = false;
        };

        $scope.generateExerciseGraph = function() { 
            var monitorGraph = Highcharts.chart('container', {
                chart: {
			        type: 'line'
			    },
			    title: {
			        text: 'Daily Physical Activity'
			    },
			    subtitle: {
			        text: 'Source: Healthy Coping App for the Google Home'
			    },
			    xAxis: {
			        categories: $scope.dates
			    },
			    yAxis: {
			        title: {
			            text: 'Time Exercised (minutes)'
			        }
		        },
			    plotOptions: {
			        line: {
			            dataLabels: {
			                enabled: true
			            },
			            enableMouseTracking: false
			        }
			    },
			    series: [{
			        name: 'patient1',
			        data: $scope.exerciseData
			    }]
            }); 
        	$scope.coping = false;
        };

        $scope.generateWeightGraph = function() { 
            var monitorGraph = Highcharts.chart('container', {
                chart: {
			        type: 'line'
			    },
			    title: {
			        text: 'Patient Weight'
			    },
			    subtitle: {
			        text: 'Source: Healthy Coping App for the Google Home'
			    },
			    xAxis: {
			        categories: $scope.dates
			    },
			    yAxis: {
			        title: {
			            text: 'Weight (lbs)'
			        }
		        },
			    plotOptions: {
			        line: {
			            dataLabels: {
			                enabled: true
			            },
			            enableMouseTracking: false
			        }
			    },
			    series: [{
			        name: 'patient1',
			        data: $scope.weightData
			    }]
            }); 
            $scope.coping = false;
        };

        $scope.getCopingData = function() {
        	var ref = firebase.database().ref("/").child('copingAnswers/patient1');
		    var afterCoping = ref.once('value').then(function (snapshot) {
		        var obj = snapshot.val();
		        for (var i in obj) {
		            $scope.copingAnswers.push(obj[i]);
		        }
		        console.log($scope.copingAnswers);

		        for (var i = 0; i < $scope.copingAnswers.length; i++) {
					$scope.interest.push(parseCope($scope.copingAnswers[i].interest));  
					$scope.down.push(parseCope($scope.copingAnswers[i].down));  
					$scope.sleep.push(parseCope($scope.copingAnswers[i].sleep));  
					$scope.energy.push(parseCope($scope.copingAnswers[i].energy));  
					$scope.appetite.push(parseCope($scope.copingAnswers[i].appetite));  
					$scope.negative.push(parseCope($scope.copingAnswers[i].negative));  
					$scope.concentrate.push(parseCope($scope.copingAnswers[i].concentrate));  
					$scope.movement.push(parseCope($scope.copingAnswers[i].movement));  
					$scope.dead.push(parseCope($scope.copingAnswers[i].dead));  
				}
				for (var j = 0; j < $scope.copingAnswers.length; j++) {
					$scope.copeTimestamps.push($scope.copingAnswers[j].timestamp); 
				} 
				for (var k = 0;  k < $scope.copeTimestamps.length; k++) {
					var date = $scope.copeTimestamps[k];
					var T = date.indexOf("T");
					var d = date.substring(0, T);
					$scope.copeDates[k] = d;
				}
				console.log($scope.copeDates);
				console.log($scope.copeDates.length);

				$scope.loaded = true;
			})
        }

        function parseCope (data) {
        	if (data == "very often") {
        		return 3;
        	} else if (data == "often") {
        		return 2;
        	} else if (data == "sometimes") {
        		return 1;
        	} else {
        		return 0;
        	}
        }

        $scope.generateCopingGraph = function() {
        	var maxDates;
        	var scroll = false;
        	var height = 500;
        	var barWidth = 15;

        	if ($scope.timeSelected == 'weekly')  {
        		maxDates = 7 - 1;
        	} else if ($scope.timeSelected == 'monthly') {
        		maxDates = 31;
        		scroll = true;
        		height = 700;
        		barWidth = 15;
        	} else if ($scope.timeSelected == 'all') {
        		maxDates = $scope.copeDates.length - 1;
        		scroll = true;
        		height = 720;
        		barWidth = 30 - maxDates*2;
        	} 
        	var newDates = $scope.copeDates.slice(0, maxDates);

        	console.log($scope.timeSelected);
        	console.log(maxDates);

        	var copingGraph = Highcharts.chart('container', {
			    chart: {
			    	marginTop: 150,
			    	height: height,
			        type: 'bar'
			    },
			    title: {
			        text: 'Depression Screening (PHQ-9) Results	'
			    }, 
			    subtitle: {
				        text: 'Source: Healthy Coping App for the Google Home'
			    },
			    xAxis: {
			    	max: maxDates,
			    	// tickPositioner: function() {
				    //     var result = [];
				    //     for(var i = 0; i < maxDates; i++)
				    //         result.push(i);
				    //     return result;
				    // },
			        categories: $scope.copeDates,
			        scrollbar: {
			            enabled: scroll
			        }
			    },
			    yAxis: {
			        min: 0,
			        max: 27,
			        tickInterval: 1,
			        title: {
			            text: 'Total screening score'
			        }, 
			        plotBands: [{
			                from: 0,
			                to: 5,
			                color: 'rgba(0, 0, 0, 0.1)',
			                label: {
			                    text: 'No Depression',
			                    y: -30	
			                } 
			            },
			            {
			            	from: 5,
			                to: 10,
			                color: 'rgba(0, 0, 0, 0.2)',	
			                label: {
			                    text: 'Mild',
			                    y: -30
			                }
			            }, 
			            {
			            	from: 10,
			                to: 15,
			                color: 'rgba(0, 0, 0, 0.3)',
			                label: {
			                    text: 'Moderate',
			                    y: -30
			                }
			            }, 
			            {
			            	from: 15,
			                to: 20,
			                color: 'rgba(0, 0, 0, 0.4)',
			                label: {
			                    text: 'Moderately Severe',
			                    y: -30
			                }
			            }, 
			            {
			            	from: 20,
			                to: 28,
			                color: 'rgba(0, 0, 0, 0.5)',
			                label: {
			                    text: 'Severe',
			                    y: -30
			                }
			            }]
			    },
			    legend: {
			        reversed: true
			    },
			    plotOptions: {
			        series: {
			            stacking: 'normal',
			            pointWidth: barWidth,
			            pointPadding: 5
			        }
			    },
			    //colors: ["#228B22", "#00FF00", "#24E0FB", "#2F74D0", "#6755E3", "#AE70ED","#FF4AFF", "#FFA500", "#FF5719"],
			    colors: ["#ED5565", "#FFA500", "#FFCE54", "#A0D468", "#48CFAD", "#4FC1E9", "#5D9CEC", "#AC92EC", "#EC87C0"],
			    series: [{
			        name: 'Lack of Interest',
			        data: $scope.interest
			    }, {
			        name: 'Depressed',
			        data: $scope.down
			    }, {
			        name: 'Trouble Sleeping',
			        data: $scope.sleep
			    }, {
			        name: 'Low Energy',
			        data: $scope.energy
			    }, {
			        name: 'Abnormal Appetite',
			        data: $scope.appetite
			    }, {
			        name: 'Self-Deprecation',
			        data: $scope.negative
			    }, {
			        name: 'Trouble Concentrating',
			        data: $scope.concentrate
			    }, {
			        name: 'Anxious Movement',
			        data: $scope.movement
			    }, {
			        name: 'Suicidal Thoughts',
			        data: $scope.dead
			    }]
			});

			$scope.coping = true;
        }
    }
})();