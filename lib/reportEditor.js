function _Report() {
    this.suites = [];
    this.tests = [];
}

function _updateAllStats(passed, failed, pending, statsArray) {
    statsArray.forEach(function (stat) {
        if (passed) {
            stat.pass += 1;
        }
        else if (failed) {
            stat.fail += 1;
        }
        else if (pending) {
            stat.pending += 1;
        }
    });
}

function _write(suites, tests, suite, statsArray) {
    suite.suites.forEach(function (mochaSuiteItem) {
        var suiteItem = {};
        suiteItem.file = mochaSuiteItem.file;
        suiteItem.title = mochaSuiteItem.title;
        suiteItem.fullTitle = mochaSuiteItem.fullTitle();
        suiteItem.retries = mochaSuiteItem._retries;
        suiteItem.pending = mochaSuiteItem.pending;
        suiteItem.slow = mochaSuiteItem._slow;
        suiteItem.timeout = mochaSuiteItem._timeout;

        // Recursively add subtests, subsuites
        suiteItem.suites = [];
        suiteItem.tests = [];
        suiteItem.stats = {
            pass: 0,
            fail: 0,
            pending: 0
        };
        statsArray.push(suiteItem.stats);
        _write(suiteItem.suites, suiteItem.tests, mochaSuiteItem, statsArray);
        statsArray.pop();
        suites.push(suiteItem);
    });

    suite.tests.forEach(function (mochaTestItem) {
        var testItem = {};
        testItem.file = mochaTestItem.file;
        testItem.title = mochaTestItem.title;
        testItem.fullTitle = mochaTestItem.fullTitle();
        testItem.retries = mochaTestItem._retries;
        testItem.slow = mochaTestItem._slow;
        testItem.timeout = mochaTestItem._timeout;
        testItem.pending = mochaTestItem.pending;
        testItem.passed = (mochaTestItem.state === 'passed');
        testItem.failed = (mochaTestItem.state === 'failed');
        _updateAllStats(testItem.passed, testItem.failed, testItem.pending, statsArray);
        tests.push(testItem);
    });
};

var ReportEditor = {
    writeReport: function (suite) {
        var report = new _Report();
        _write(report.suites, report.tests, suite, []);
        return report;
    }
};

module.exports = ReportEditor;