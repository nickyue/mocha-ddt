/****
 * Objective: Ability to run tests within a folder should be agnostic to folder structure.
 ****/

const mochaddt = require('../index');
mochaddt.setTestDir("./test-folder-structure");

var tests = {
    "addTests should work for nested folder structure": function() {
        mochaddt.addTests(/should run/, {});
        mochaddt.run();
    },
    "multiple addTests should work for nested folder structure": function() {
        mochaddt.addTests(/controller1-test-2 should run/, {});
        mochaddt.addTests(/root-test-1 should run/, {});
        mochaddt.run();
    }
};

Object.keys(tests).forEach(function (test) {
    console.log(test);
    tests[test]();
});