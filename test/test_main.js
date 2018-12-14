/**
 *  Will run all tests under test folder
 **/

const fs = require("file-system");
const path = require("path");

var allFiles = fs.readdirSync(__dirname);

function indent(x) {
    return Array(4*x+1).join(" ");
}

var stats = {
    pass: 0,
    fail: 0
};

allFiles.forEach(function (file) {
    if (file.substr(-3) === '.js' && file !== "test_main.js" && file.substr(0, 4) === 'test') {
        // Is JS file
        console.log(file);
        var tests = require(path.join(__dirname, file));
        Object.keys(tests).forEach(function (test) {
            try {
                tests[test]();
                stats.pass += 1;
                console.log(`${indent(1)}${test}: pass`);
            }
            catch (err) {
                stats.fail += 1;
                console.log(`${indent(1)}${test}: fail`);
                console.log(`Error message: ${err.message}`);
            }
        });
    }
});

console.log(`Pass: ${stats.pass}, Fail: ${stats.fail}`);