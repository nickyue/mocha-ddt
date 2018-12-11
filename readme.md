# mocha-ddt

> Data-Driven-Testing for Mocha

[![Build Status](https://travis-ci.org/nickyue/mocha-ddt.svg?branch=master)](https://travis-ci.org/nickyue/mocha-ddt.svg?branch=master) 
[![Coverage Status](https://coveralls.io/repos/github/nickyue/mocha-ddt/badge.svg)](https://coveralls.io/github/nickyue/mocha-ddt)
## Install and use

```
$ npm install mocha-ddt --save
```



## Getting started

```javascript
$ npm install mocha-ddt --save
$ mkdir test
$ $EDITOR test/test.js
$ $EDITOR index.js
```

In test.js:

```javascript
var assert = require('chai').assert;
var mochaddt = require('mocha-ddt');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            var array = mochaddt.input(this, "array");
            var value = mochaddt.input(this, "value");
            assert.equal(array.indexOf(value), -1);
        });
    });
})
```

In index.js:

```javascript
var mochaddt = require('mocha-ddt');
mochaddt.setTestDir("./test");
mochaddt.addTests(/#indexOf() should return -1 when the value is not present/, {
    input: {
        array: [1,2,3],
        value: 4
    }
});
mochaddt.run();
```

## Features

### input

**input** is used to retrieve inputs for running a set of test cases.

```javascript
var some_var_name = mochaddt.input(this, "<INPUT_NAME>", <DEFAULT_VALUE>);
```

INPUT_NAME: Name of the input that you need. Refer to addTests.

DEFAULT_VALUE<optional>:  Optionally give a default value. In case no input is specified when running test, default value will be used. It is encouraged to provide a default value, so that you can run tests using standard Mocha interface.

Example:

```javascript
var mochaddt = require('mocha-ddt');
describe('country API', function() {
    var country = mochaddt.input(this, "country", "USA");
    describe('province API', function() {
        var province = mochaddt.input(this, "province", "CA");
        describe('city API', function() {
            var city = mochaddt.input(this, "city", "San Francisco");
            it(`can give me the location of ${city}`, function() {
                var config = mochaddt.input(this, "config", {});
                // You can use country, province, city and config here
            });
        });
    });
    
    describe('country overview API', function() {
        it(`can give an overview of ${country}`, function() {
            
        });
    });
});
```

As can be seen in the example, input can be used inside *describe* block and *it* block.

## output, fetch

**output** is used inside a test case to output values, so that other test cases can use the output values.

**fetch**, on the other hand, is used to fetch the output from a test case.

Note that you can only fetch from a test case that is within the same *describe* block.

Example:

```javascript
describe('account management api', function() {
    describe('functional test', function() {
        it('can create a new user', function() {
            var cuid = <api_call_to_create_user>.res.cuid;
            mochaddt.output(this, cuid);
        });
        
        it('can get the newly created user', function() {
            var cuid = mochaddt.fetch(this, "can create a new user");
            // ...
        });
        
        it('can put the newly created user', function() {
            var cuid = mochaddt.fetch(this, "can create a new user");
            // ...
        });
        // ...
    });
});
```

This certainly breaks the independency between test cases, but it is necessary sometimes especially for functional/E2E test suites. However, test cases in unit testing should remain independent and this feature shouldn't be used.

## Calling API

mocha-ddt provides tools to send API requests.

#### Supported methods to call API

Synchronous API calls: getSync, putSync, deleteSync, postSync, patchSync, headSync, optionsSync

Asynchronous API calls (Promise based): get, put, delete, post, patch, head, options

Example of calling a GET API synchronously:

```javascript
var options = {
    path: '/customers',
    headers: {
        <headerKey>:<headerValue>,
        //...
    },
    qs: {
        <queryKey>:<queryValue>,
        //...
    }
};
mochaddt.utils.getSync(options);
```

#### Options for API requests

You can specify an API request in either *options* or *mochaddt.utils*.

##### options:

- path: A string. Path of API call. In case endPoint is not specified in *mochaddt.utils*, you need to put full URL here.
- headers: key-value pair in JSON for headers.
- qs: key-value pair in JSON for query parameters. 
- body: JSON object for body. You shouldn't specify body for GET, HEAD API calls.

##### mochaddt.utils:

- endPoint: This is the end point for API calls. E.g. https://api.myserver.com/v1.2/
- headers: Same as in options.
- body: Same as in options.
- qs: Same as in options.

Specifications in options apply only to 1 API call, whereas in mochaddt.utils, it is applied to all subsequent API calls.

**headers, body** and **qs** in *options* and *mochaddt.utils* will be deeply merged when calling an API through mochaddt.utils method. In case of conflict, values in *options* have priority. You should avoid conflict to prevent confusion.

If mochaddt.utils.endPoint is defined, endPoint and options.path will be combined

## Environment

