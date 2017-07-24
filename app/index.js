'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./healthycoping-f6c2f-firebase-adminsdk-2k6pw-29793bc767.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://healthycoping-f6c2f.firebaseio.com/"
});

var monitoring = [];
var coping = [];
var solving = ["Let's see, were you more stressed than usual?", "Were you traveling?", "Were you sick?", 
               "Did something change in your routine (new job, getting up earlier or staying up later)?", 
               "Were you less active than usual?", "Did you eat more carbohydrates than usual?",
               "Did you take more or less diabetes medication than usual?", 
                "Those are all the questions I can think of. If this problem is still bothering you, please call your doctor and ask what could be wrong."];
var vegetables = [];
var starches = [];
var proteins = [];

function getAllQuestion() {
    var ref = admin.database().ref("/").child('monitoring');
    var afterMonitoring = ref.once('value').then(function(snapshot) {
        var monitoringQuestions = []
        var obj = snapshot.val();
        for (var i in obj) {
            monitoringQuestions.push(obj[i]);
        }
        return monitoringQuestions;
    })
    var afterCoping = afterMonitoring.then(function(monitoringQuestions) {
        var data = {}
        data['monitoring'] = monitoringQuestions
        data['coping'] = []
        var cope = admin.database().ref("/").child('coping');
        var finishedCoping = cope.once('value').then(function(snapshot) {
            var copingQuestions = []
            var obj = snapshot.val();
            for (var i in obj) {
                copingQuestions.push(obj[i]);
            }
            return copingQuestions;
        })
        var returnedData = finishedCoping.then(function(copingQuestions) {
            data['coping'] = copingQuestions;
            return data;
        })
        return returnedData
    });
    var afterVeggies = afterCoping.then(function(returnedData) {
        var ref = admin.database().ref("/").child('vegetables').once('value').then(function(snapshot) {
            var veggiesList = []
            var obj = snapshot.val();
            for (var i in obj) {
                veggiesList.push(obj[i]);
            }
            return veggiesList;
        }).then(function(returnedVeggieList) {
            returnedData.vegetables = returnedVeggieList;
            return returnedData
        });
        return ref;
    });

    var afterProtein = afterVeggies.then(function(returnedData) {
        var ref = admin.database().ref("/").child('proteins').once('value').then(function(snapshot) {
            var proteinList = []
            var obj = snapshot.val();
            for (var i in obj) {
                proteinList.push(obj[i]);
            }
            return proteinList;
        }).then(function(returnedProteinList) {
            returnedData.proteins = returnedProteinList;
            return returnedData
        });
        return ref;
    });
    var afterStarches = afterVeggies.then(function(returnedData) {
        var ref = admin.database().ref("/").child('starches').once('value').then(function(snapshot) {
            var starchesList = []
            var obj = snapshot.val();
            for (var i in obj) {
                starchesList.push(obj[i]);
            }
            return starchesList;
        }).then(function(returnedStarchesList) {
            returnedData.starches = returnedStarchesList;
            return returnedData
        });
        return ref;
    });
    return afterStarches;
}


var monitorCount = 0;
var copingCount = 0;
var solvingCount = 0;
var monitorAnswers = [];
var copeAnswers = [];
var date = 0;
var score = 0;

function monitorResult(ate, sugar, medication, exercise, weight) {
    var result = "";
    if (ate == "yes" && sugar >= 150) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try taking a brisk walk or doing aeorbic exercises for 10 minutes.";
    } else if (ate == "yes" && sugar < 150) {
        result += "Your blood sugar level of " + sugar + " is normal. That's great! ";
    } else if (ate == "no" && sugar > 125) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try taking a brisk walk or doing aeorbic exercises for 10 minutes.";
    } else if (ate == "no" && sugar >= 75 && sugar <= 125) {
        result += "Your blood sugar level of " + sugar + " is normal. Keep it up! ";
    } else {
        result += "Your blood sugar is too low. I suggest eating a small amount of carbs, about 15 or 20 grams. ";
    }

    if (medication == "no") {
        result += "Also, don't forget to take your medication! "
    }
    return result;
}

function copingResult(answers) {
    var result = "";
    for (var i = 0; i < answers.length; i++) {
        if (answers[i] == "very often") {
            score += 3;
        } else if (answers[i] == "often") {
            score += 2;
        } else if (answers[i] == "sometimes") {
            score += 1;
        }
    }
    console.log(score);

    if (score > 19 && score <= 27) {
        result += "You are showing signs of severe major depression. Please tell your doctor and ask for help. ";
    } else if (score >= 15 && score <= 19) {
        result += "You are showing signs of major depression at a moderately severe level. Consider discussing this with your doctor.";
    } else if (score >= 10 && score <= 14) {
        result += "You are showing signs of moderate depression. Consider contacting a support group to talk about how you're feeling.";
    } else if (score >= 5 && score <= 9) {
        result += "You have mild symptoms of depression. Come back and take the survey next month.";
    } else {
        result += "You seem to be doing all right! I'm glad.";
    }

    return result;
}

function writeMonAnswers(monitorAnswers) {
    var fb = admin.database().ref('/monitoringAnswers/patient1');
    fb.push({
        ate: monitorAnswers[0],
        glucose: monitorAnswers[1],
        medication: monitorAnswers[2],
        exercise: monitorAnswers[3],
        weight: monitorAnswers[4],
        timestamp: date
    }).then(function(ref) {
        //console.log(ref);
    }, function(error) {
        console.log("Error:", error);
    });
}

function writeCopeAnswers(copeAnswers) {
    var fb = admin.database().ref('/copingAnswers/patient1');
    fb.push({
        interest: copeAnswers[0],
        down: copeAnswers[1],
        sleep: copeAnswers[2],
        energy: copeAnswers[3],
        appetite: copeAnswers[4],
        negative: copeAnswers[5],
        concentrate: copeAnswers[6],
        movement: copeAnswers[7],
        dead: copeAnswers[8],
        score: score,
        timestamp: date
    }).then(function(ref) {
        //console.log(ref);
    }, function(error) {
        console.log("Error:", error);
    });
}

var tries = 0;
var previousAction = "none";

getAllQuestion().then(function(returnVal) {
    monitoring = returnVal.monitoring
    coping = returnVal.coping
    vegetables = returnVal.vegetables
    proteins = returnVal.proteins
    starches = returnVal.starches


    const restService = express();

    restService.use(bodyParser.urlencoded({
        extended: true
    }));

    restService.use(bodyParser.json());
    restService.post('/reply', function(req, res) {
        console.log(req.body.result.resolvedQuery);
        var action = req.body.result.action;
        var text;
        var number = false;
        var yesno = false;

        console.log("previousAction " + previousAction);

        switch (action) {
            case "monitoring.continue":
                action = "start.monitor";

            case "start.monitor":
                if (previousAction == "start.coping" && copingCount <= 9) {
                    console.log("was coping, rerouting");
                    text = "Sorry, but your options are very often, <break time=\"1s\"/> often, <break time=\"1s\"/> sometimes, <break time=\"1s\"/> Or never. "
                    + "Now tell me, how often do you experience " + coping[copingCount - 1].title;
                    break;
                }
                if (monitorCount >= monitoring.length) {
                    if (req.body.result.parameters.number.length != 0 && monitoring[monitorCount - 1].type == "number") {
                        monitorAnswers.push(req.body.result.parameters.number);
                    } else if (req.body.result.parameters.yesno.length != 0 && monitoring[monitorCount - 1].type == "yesno") {
                        monitorAnswers.push(req.body.result.parameters.yesno);
                    }
                    monitorCount = 0;

                    var ate = monitorAnswers[0];
                    var sugarLevel = monitorAnswers[1];
                    var medication = monitorAnswers[2];
                    var exercise = monitorAnswers[3];
                    var weight = monitorAnswers[4];
                    console.log(monitorAnswers);
                    date = req.body.timestamp;
                    console.log(date);

                    console.log(monitorAnswers);
                    //writeMonAnswers(monitorAnswers);

                    text = "I'll get this logged for you ASAP. " 
                        + monitorResult(ate, sugarLevel, medication, exercise, weight)
                        + "What else can I do for you? If you're done, just say 'OK Google, stop.'";
                    break;
                }

                text = monitoring[monitorCount].title;
                console.log("text before: " + text);

                console.log("count of title: " + monitorCount);
                // console.log("question: " + monitoring[monitorCount]);
                

                // if (req.body.result.parameters.number.length != 0) {
                //     monitorAnswers.push(req.body.result.parameters.number);                
                // } else if (req.body.result.parameters.yesno.length != 0) {
                //     monitorAnswers.push(req.body.result.parameters.yesno);
                // }
                
                var hit = false;

                // console.log("type: " + monitoring[monitorCount].type);
                var answered = req.body.result.parameters.yesno.length != 0;
                var correctType = monitoring[monitorCount].type == "yesno";
                // console.log("type boolean: " + answered + " "  + correctType);
                // console.log("num length: " + req.body.result.parameters.number.length);

                if (monitorCount > 0) {
                    console.log("in loop");
                    if (req.body.result.parameters.number.length != 0 && monitoring[monitorCount - 1].type == "number") {
                        monitorAnswers.push(req.body.result.parameters.number);
                        hit = true;
                        monitorCount++;
                    } else if (req.body.result.parameters.yesno.length != 0 && monitoring[monitorCount - 1].type == "yesno") {
                        monitorAnswers.push(req.body.result.parameters.yesno);
                        hit = true;
                        monitorCount++;
                    } 
                     else if (req.body.result.parameters.number.length == 0 && monitoring[monitorCount - 1].type == "number") {
                        monitorCount--;
                        text = monitoring[monitorCount].title;
                    } else if (req.body.result.parameters.yesno.length == 0 && monitoring[monitorCount - 1].type == "yesno") {
                        monitorCount--;
                        text = monitoring[monitorCount].title;
                        text += "prompt";
                    } 
                }
                console.log("hit: " + hit);
                // var decrement = !hit && monitorCount != 0;
                // console.log("decrement boolean: " + decrement);
                // if (!hit && monitorCount != 0) {
                //     monitorCount--;
                // }

                if (monitorCount == 0) {
                    monitorCount++;
                }
                
                // console.log("number boolean: " + number);
                // console.log("yn boolean: " + yesno);
                // console.log("tries: " + tries);
                console.log(monitorAnswers);
                console.log("monitorCount after: " + monitorCount);
                console.log("text after: " + text);
                break;

            case "coping.instructions":
                // text = 'Okay, <break time="1s"/> I will ask you about your experiences with some problems that may have happened over the past week. '
                // + 'You can answer the following questions by saying. Very often, <break time="1s"/> often,   <break time="1s"/> sometimes, <break time="1s"/> Or never.'
                // + ' Just say "ready" when you are.'
                text = 'You can answer the following questions by saying. Very often, <break time="1s"/> often, <break time="1s"/> sometimes, <break time="1s"/> Or never.'
                + ' Just say "ready" when you are.'

                break;

            case "coping.continue":
                action = "start.coping";

            case "start.coping":
                if (copingCount >= coping.length) {
                    if (req.body.result.parameters.frequency.length != 0 && coping[copingCount].type == "frequency") {
                        copeAnswers.push(req.body.result.parameters.frequency);
                    } 
//                     else if (req.body.result.parameters.yesno.length != 0) {
//                         copeAnswers.push(req.body.result.parameters.yesno);
//                     }
                    copingCount = 0;

                    console.log(copeAnswers);
                    date = req.body.timestamp;
                    
                    text = "Thank you for answering my questions. " 
                        + copingResult(copeAnswers)
                        + " If you're done, just say 'OK Google, stop.'";
                    //writeCopeAnswers(copeAnswers);
                    score = 0; 
                    copeAnswers = [];
                    
                    break;
                }
                text = coping[copingCount].title;

//                 if (req.body.result.resolvedQuery.includes("ready") {
//                     copingCount++;
//                 } else 
                if (req.body.result.parameters.frequency.length != 0 && coping[copingCount].type == "frequency") {
                    copeAnswers.push(req.body.result.parameters.frequency);
                    
                }

                copingCount++;
                break;

            //dietary advice action based on the diabetes.org "food plate" page.
            case "food.plate":
                var vDecider = Math.random() * vegetables.length;
                var vIndex = Math.floor(vDecider);
                var sDecider = Math.random() * starches.length;
                var sIndex = Math.floor(sDecider);
                var pDecider = Math.random() * proteins.length;
                var pIndex = Math.floor(pDecider);
                text = "I recommend filling 1/2 of your plate with " + vegetables[vIndex].type +
                    ", 1/4 with " + starches[sIndex].type + " , and 1/4 with " + proteins[pIndex].type +
                    ". If you want to change the plate, just say \"make another plate\".";
                break;
                
            case "problem.solving": 
                text = solving[solvingCount];
               
                if (req.body.result.parameters.yesno == "yes") {
                    switch (solvingCount) {
                        case 1: 
                            text = "Think of ways you can ease stress, such as by meditating, doing yoga, "
                            + "or sitting quietly for a few minutes with a cup of tea or a book.";
                            break;
                        case 2: 
                            text = "Traveling can be stressful and tiring sometimes, which can cause your glucose level to " 
                            + "become abnormal. Try to relax by meditating, doing yoga, "
                            + "or sitting quietly for a few minutes with a cup of tea or a book.";
                            break;
                        case 3: 
                            text = "When you are sick, it is harder to keep your blood glucose in your target range. "
                            + "Drink lots of non-caloric liquids to keep from getting dehydrated. " 
                            + "Extra fluids will also help get rid of the extra glucose in your blood.";
                            break;
                        case 4:
                            text = "Sudden changes in your routine can definitely be a cause of stress, which can lead to " 
                            + "difficulty controlling your diabetes. Take a deep breath and relax; life will get back on course soon.";
                            break;
                        case 5: 
                            text = "Being active is an important part of being healthy and controlling your blood sugar. " 
                            + "Choose the best ways to fit physical activity into your daily life—whether it’s walking to work, doing chair exercises or working out at the gym." 
                            + "The important thing to remember is to choose activities that you enjoy doing and to set goals that are realistic.";
                            break;
                        case 6: 
                            text = "Eating too many carbs can cause your blood glucose to rise. Try substituting heavy carbs with something healthier, "
                            + "like whole wheat products, vegetables, and heart-healthy meats. You can learn more about correct dietary habits by asking me " 
                            + "what you should or should not eat";
                            break;
                        case 7: 
                            text = "It is important to take your diabetes medication regularly and at the apporpriate time. You can ask me "
                            + "to help you with reminders by simply saying: 'remind me about my medicine'";
                            break;
//                         default: 
//                             solvingCount++;
                    }
                }
                solvingCount++
                break;

            case "restart":
                monitorCount = 0;
                copingCount = 0;
                solvingCount = 0;
                monitorAnswers = [];
                console.log(monitorAnswers);
                copeAnswers = [];
                score = 0;
                text = "Sure thing. I've reset all the surveys so you can start from the beginning. What would you like to do now?";
                break;

            case "help":
                text = "I can assist you with monitoring your health, emotional coping with your diabetes, and food recommendations." +
                    " Just say any of the key words and we can get started! If you want to stop, just say 'Ok Google, stop'.";
                break;

            default:
                text = "Error. Could not find appropriate action.";
        }

        previousAction = action;

        return res.json({
            speech: '<speak> ' + text + ' </speak>',
            displayText: text,
            source: "survey-demo-app"
        });
    });

    restService.get('/', function(req, res) {
        return "Hello and welcome.";
    });

    restService.listen((process.env.PORT || 8085), function() {
        console.log("Server up and running");
    });

});
