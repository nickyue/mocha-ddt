const fs = require("file-system");
const path = require('path');

function _PDS(runner, dir) {
    this.runner = runner;
    this.dir = dir;
}

_PDS.prototype.read = function (varName) {
    var dir = path.resolve(this.dir, './pds');
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            return null;
        }
        var valInString = fs.readFileSync(path.join(dir, `${varName}.json`), {encoding: 'utf8'});
        var valInJson = JSON.parse(valInString);
        return valInJson;
    }
    catch (err) {
        this.runner._addMessage("error", `Error when PDS tried to read ${varName}: ${err.message}.`);
        return false;
    }
};

_PDS.prototype.write = function (varName, valInJson) {
    var dir = path.resolve(this.dir, './pds');
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            return null;
        }
        var valInString = JSON.stringify(valInJson);
        fs.writeFileSync(path.join(dir, `${varName}.json`), valInString);
        return true;
    }
    catch (err) {
        this.runner._addMessage("error", `Error when PDS tried to save ${varName}: ${err.message}.`);
        return false;
    }
};

module.exports = _PDS;