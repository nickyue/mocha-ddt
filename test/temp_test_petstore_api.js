const mochaddt = require('../index');
const path = require('path');

mochaddt.setTestDir(path.join(__dirname, './test-petstore-api'));
var tests = {
    "temp": function() {
        mochaddt.loadEnvConfig(path.join(__dirname, './env_petstore.js'));
        mochaddt.addTests(/POST \/store\/order will create an order with correct status/, {
            environment: {
                schemes: "https"
            },
            input: {
                status: "placed"
            }
        });
        mochaddt.addTests(/POST \/store\/order will create an order with correct id/, {
            environment: {
                schemes: "https"
            },
            input: {
                id: "2"
            }
        });
        mochaddt.addTests(/GET \/pet\/:petId/, {
            environment: {
                schemes: "https"
            },
            input: {}
        })
        mochaddt.run();
    }
}

tests["temp"]();

module.exports = tests;