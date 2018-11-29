// my-reporter.js
var mocha = require('mocha');
module.exports = MyReporter;

function MyReporter(runner) {
    mocha.reporters.Base.call(this, runner);
    var passes = 0;
    var failures = 0;
    var status = {};
    runner.on('pass', function(test){
        passes++;
        status[test.fullTitle()] = (status[test.fullTitle()]) ? status[test.fullTitle()] + 1 : 1;
    });

    runner.on('fail', function(test, err){
        failures++;
        status[test.fullTitle()] = false;
    });

    runner.on('end', function() {
        //console.log(JSON.stringify(status));
    });
}

// To have this reporter "extend" a built-in reporter uncomment the following line:
// mocha.utils.inherits(MyReporter, mocha.reporters.Spec);