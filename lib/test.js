const uniqid = require('uniqid');

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

module.exports = _Test;