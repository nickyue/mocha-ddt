const mochaddt = require('../index');

mochaddt.setTestDir('./tests_for_test');

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

Object.keys(tests).forEach(function (test) {
    console.log(test);
    tests[test]();
});