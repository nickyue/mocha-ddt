const mochaddt = require('../index');
const path = require('path');

mochaddt.setTestDir(path.join(__dirname, './test-array'));

var tests = {
    "able to provide single object as an input to tests": function() {
        mochaddt.addTests(/unit testing #indexOf/, {
            input: {
                array: [1, 2, 3],
                element: 4,
                expected: -1
            }
        });
        mochaddt.run();
    },
    "response from #input is a copy of the stored input object": function() {
        mochaddt.addTests(/unit testing #push/, {
            input: {
                array: [1, 2],
                element: 3
            }
        });
        mochaddt.run();
    }
};

module.exports = tests;