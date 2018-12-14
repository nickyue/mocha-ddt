const uniqid = require('uniqid');
const Editor = require('./reportEditor');
const path = require('path');
const deasync = require('deasync');
const fs = require('file-system');
function _loadTests(dir, mocha) {
    var allTestFiles = _findTestScriptsRecursive(path.resolve(dir), []);
    allTestFiles.forEach(function(file) {
        mocha.addFile(file);
    });
}

function _findTestScriptsRecursive(baseDir, dirArray) {
    var dir = baseDir;
    dirArray.forEach(function(folderName) {
        dir += `/${folderName}`;
    });
    dir = path.normalize(dir);
    var filesInCurrentDir = fs.readdirSync(dir);
    var allFilesUnderCurrentDir = [];
    filesInCurrentDir.forEach(function (file) {
        if (file.substr(-3) === '.js') {
            // Is test file
            var relativePath = path.join(dir, file);
            allFilesUnderCurrentDir.push(relativePath);
        }
        else
        {
            dirArray.push(file);
            var filesInSubFolder = _findTestScriptsRecursive(baseDir, dirArray);
            allFilesUnderCurrentDir = allFilesUnderCurrentDir.concat(filesInSubFolder);
            dirArray.pop();
        }
    });
    return allFilesUnderCurrentDir;
}

var _mochaRunSync = deasync(function (mocha, cb) {
    mocha.run()
        .on("end", function () {
            var report = Editor.writeReport(mocha.suite);
            cb(null, report);
        })
        .on("fail", function (test, err) {
            console.log(err);
            console.log(JSON.stringify(err.stack));
        })
        .on("pass", function (test) {
        })
        .on("suite", function (suite) {

        })
        .on("suite end", function (suite) {

        })
        .on("test", function (test) {

        })
        .on("test end", function (test) {

        });
});

function _Test(regex, input, environment, identifier) {
    this.regex = regex;
    this.input = (input)?input:{};
    this.output = {};
    this.envParamsVal = environment;
    this.id = (identifier) ? identifier : uniqid();
}

_Test.prototype.getRegexSrc = function () {
    return (new RegExp(this.regex)).source;
};

_Test.prototype.getInput = function (scope, attributeName) {
    if (attributeName in this.input) {
        return this.input[attributeName];
    }
    else {
        return null;
    }
};

_Test.prototype.saveOutput = function (scope, outputObj) {
    var fullTitle = scope.fullTitle();
    if (fullTitle.match(this.regex)) {
        this.output[fullTitle] = outputObj;
        return true;
    }
    else {
        return false;
    }
};

_Test.prototype.getOutput = function (scope, testName) {
    if (scope.fullTitle().match(this.regex)) {
        var scopeTitlePath = scope.titlePath();
        var sourceFullTitle;
        if (scopeTitlePath.length > 1) {
            sourceFullTitle = scopeTitlePath.slice(0, scopeTitlePath.length - 1).join(" ") + " " + testName;
        }
        else {
            sourceFullTitle = testName;
        }
        return this.output[sourceFullTitle];
    }
    else {
        return null;
    }
};

_Test.prototype.run = function (mocha, runner, testDir) {
    _loadTests(testDir, mocha);
    mocha.grep(this.regex);
    if (this.envParamsVal) {
        runner.setEnvironmentVariables(this.envParamsVal);
        runner.utils = new _Utils();
        runner._env.setup(runner.utils, runner._envParamsVal);
    }
    runner._ctx = this;
    var report = _mochaRunSync(mocha);
    for (let j = 0; j < mocha.files.length; j++) {
        let p = path.resolve(mocha.files[j]);
        let rp = require.resolve(p);
        delete require.cache[rp];
    }
    mocha.suite.suites = [];
    mocha.files = [];
    return report;
};

module.exports = _Test;