/****
 * Objective: Ability to run tests within a folder should be agnostic to folder structure.
 ****/
const path = require('path');
const mochaddt = require('../index');
const assert = require('chai').assert;

mochaddt.setTestDir(path.join(__dirname, './test-folder-structure'));
//mochaddt.setTestDir('test-folder-structure');

var tests = {
    "addTests should work for nested folder structure": function() {
        mochaddt.addTests(/should run/, {});
        var reports = mochaddt.run();
        assert.equal(reports[0].stats.pass, 10, "not all tests in test-folder-structure all run and passed.");
    },
    "multiple addTests should work for nested folder structure": function() {
        mochaddt.addTests(/controller1-test-2 should run/, {});
        mochaddt.addTests(/root-test-1 should run/, {});
        var reports = mochaddt.run();
        assert.equal(reports[0].stats.pass, 1, "only controller1-test-2 should run");
        assert.equal(reports[1].stats.pass, 1, "only root-test-1 should run");
    }
};

module.exports = tests;