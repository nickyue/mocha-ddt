const Mocha = require('mocha');
const fs = require('file-system');
const path = require('path');
const logger = require('./logger');
const assert = require('chai').assert;
const Reporter = require('./reporter');
const Test = require("./test");
const Cycle = require("./cycle");
const _Utils = require("./utils");
const deasync = require("deasync");
const _PDS = require("./pds");
const toolbox = require("./toolbox");
const Editor = require("./reportEditor");

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

function _Runner(testDir, cycleDir) {
    // Private
    this._mocha = null;
    this._testDir = testDir;
    this._cycleDir = cycleDir;
    this._loadCycles(cycleDir);
    this._tasks = [];
    this._messages = [];         // For storing info, warning or error messages
    this._dir = __dirname;
    this._env = null;
    this._envParamsVal = {};
    this._ctx = null;            //ctx stores the current task that is being run
    this._tempCtx = null;        //tempCtx is for storing a temp ctx that is created when tests are run directly from mocha instead of through mochattd

    // Public
    this.logger = logger;
    this.utils = new _Utils();
    this.pds = new _PDS(this, __dirname);
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

_Runner.prototype.setTestDir = function (dir) {
    this._testDir = dir;
};

_Runner.prototype._addMessage = function (level, message) {
    //this.messages.push({level: level, message: message});
    this.logger.log({
        level: level,
        message: message
    });
};

_Runner.prototype.loadEnvConfig = function (envConfigPath) {
    var absolutePath = path.resolve(envConfigPath);
    this._env = require(absolutePath);
    if (!this._env || (!this._env.envParams instanceof Array) || (!this._env.setup)) {
        this._addMessage("error", `Failed to load environment configuration from ${absolutePath}`);
        return false;
    }
    return true;
};

_Runner.prototype.addTests = function (regex, options) {

    // 1. Check parameter format

    // 2. Check identifier uniqueness
    var taskQueue = this._tasks;
    var isIdentifierUnique = true;
    var identifier = options ? options.identifier : null;
    var input = options ? options.input : null;
    var envParamsVal = options ? options.environment : null;
    if (identifier && identifier instanceof String) {
        taskQueue.forEach(function (existingTask) {
            if (existingTask.identifier === identifier) {
                this._addMessage("error", `You must provide a unique identifier or omit identifier parameter. This task is not added to task queue.`);
                isIdentifierUnique = false;
            }
        });
    }

    // 3. Add to runner object
    if (isIdentifierUnique) {
        taskQueue.push(new Test(regex, input, envParamsVal, identifier));
    }
};

_Runner.prototype.addCycle = function (regex, identifier) {
    //TODO
};

_Runner.prototype.run = function () {
    // TODO: Add support for cycle
    var runner = this;
    if (!runner._mocha) {
        runner._mocha = new Mocha();
        runner._mocha.reporter(Reporter);
    }
    var reports = [];
    if (this._tasks.length >= 1) {
        var currentTaskIndex = 0;
        var mocha = runner._mocha;
        mocha.files = [];
        while (currentTaskIndex < runner._tasks.length) {

            for (let j = 0; j < mocha.files.length; j++) {
                let p = path.resolve(mocha.files[j]);
                let rp = require.resolve(p);
                delete require.cache[rp];
            }
            mocha.suite.suites = [];
            mocha.files = [];
            _loadTests(runner._testDir, mocha);

            var currentTask = runner._tasks[currentTaskIndex];
            mocha.grep(currentTask.regex);

            // Set environment variables and run setup before starting next task
            // TODO: Configurables should be abstracted into a class
            if (currentTask.envParamsVal) {
                runner.setEnvironmentVariables(currentTask.envParamsVal);
                runner.utils = new _Utils();
                runner._env.setup(runner.utils, runner._envParamsVal);
            }

            // Set context before starting the next task
            runner._ctx = currentTask;
            var report = _mochaRunSync(mocha);
            report.name = currentTask.id;
            reports.push(report);
            currentTaskIndex += 1;
        }

        // Reset after running
        runner._tasks = [];
        for (let j = 0; j < mocha.files.length; j++) {
            let p = path.resolve(mocha.files[j]);
            let rp = require.resolve(p);
            delete require.cache[rp];
        }
        mocha.files = [];
        return reports;
    }
    else {
        // this._tasks.length < 1
        runner._addMessage("warn", `Task queue is empty.`);
    }
};


_Runner.prototype._loadCycles = function (path) {

};

var runner = new _Runner("./test", "./cycle");

runner.input = function (scope, attributeName, defaultValue) {
    var currentTask = runner._ctx;
    if (!currentTask) {
        runner._addMessage("warn", `${scope.fullTitle()}: Runner context is not defined. Possibly because test is run from mocha interface. Using default values for inputs.`);
        return toolbox.clone(defaultValue);
    }
    else {
        var input = currentTask.getInput(scope, attributeName);
        if (input === undefined || input === null) {
            return toolbox.clone(defaultValue);
        }
        else {
            return toolbox.clone(input);
        }
    }
};

runner.output = function (scope, outputObj) {
    var currentTask = runner._ctx;

    if (!scope.test) {
        runner._addMessage("error", `output function can only be run in a test case.`);
        return;
    }
    scope = scope.test;
    if (!currentTask) {
        runner._addMessage("warn", `${scope.fullTitle()}: Runner context is not defined. Possibly because test is run from mocha interface. A temporary context is created to facilitate output and fetch.`);
        // Creating a temp ctx
        runner._tempCtx = new Test(/[\s\S]*/, {}, {});
        var saved = runner._tempCtx.saveOutput(scope, outputObj);
        if (!saved) {
            runner._addMessage("error", `${scope.fullTitle()}: Unable to save output to temp ctx.`);
        }
    }
    else {
        var saved = currentTask.saveOutput(scope, outputObj);
        if (!saved) {
            runner._addMessage("error", `${scope.fullTitle()}: Unable to save output.`);
        }
    }
    return;
};

runner.fetch = function (scope, testName) {
    var currentTask = runner._ctx;

    if (!scope.test) {
        runner._addMessage("error", `fetch function can only be run in a test case.`);
        return;
    }
    scope = scope.test;

    if (!currentTask) {
        runner._addMessage("warn", `${scope.fullTitle()}: Runner context is not defined. Possibly because test is run from mocha interface. Using temporary context.`);
        var tempCtx = runner._tempCtx;
        if (!tempCtx) {
            runner._addMessage("error", `${scope.fullTitle()}: No temp ctx defined. Possibly due to no output statement is defined prior within the same scopr as fetch.`);
            return;
        }
        else {
            var outputObj = tempCtx.getOutput(scope, testName);
            if (outputObj === null || outputObj === undefined) {
                runner._addMessage("error", `${scope.fullTitle()}: Unable to retrieve output from ${testName}. Please check on output statement and scope. Note that fetch only works on test cases defined prior fetch statements and within the same test suite.`);
                return null;
            }
            else {
                return outputObj;
            }
        }
    }
    else {
        var outputObj = currentTask.getOutput(scope, testName);
        if (outputObj === null || outputObj === undefined) {
            runner._addMessage("error", `${scope.fullTitle()}: Unable to retrieve output from ${testName}. Please check on output statement and scope. Note that fetch only works on test cases defined prior fetch statements and within the same test suite.`);
            return null;
        }
        else {
            return outputObj;
        }
    }
    return;
};

runner.setEnvironmentVariables = function (obj) {
    var env = runner._env;
    var envParamsVal = runner._envParamsVal;
    if (env) {
        Object.keys(obj).forEach(function (key) {
            if (env.envParams.includes(key)) {
                envParamsVal[key] = obj[key];
            }
            else {
                runner._addMessage("warn", `${key} is not set as it is not specified as an environment parameter in configuration file.`);
            }
        });
    }
    else {
        runner._addMessage("warn", "Unable to set environment variables as there is no environment specified.");
    }
};

runner.getEnvironmentVariables = function () {
    return runner._envParamsVal;
};

module.exports = runner;