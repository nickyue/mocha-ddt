const mochaddt = require("../../../index");
const assert = require("chai").assert;

describe("unit tests", function() {
    describe("pet", function () {
        describe("GET /pet/:petId", function() {
            var id = 123;
            this.timeout(10000);
            beforeEach(function() {
                var createPet = mochaddt.utils.postSync({
                    path: "/pet",
                    body: {
                        "id": id,
                        "category": {
                            "id": 0,
                            "name": "string"
                        },
                        "name": "mochaddt",
                        "photoUrls": [
                            "string"
                        ],
                        "tags": [
                            {
                                "id": 0,
                                "name": "string"
                            }
                        ],
                        "status": "available"
                    }
                });
            });

            it("response has correct id, category, name, photoUrls, tags, and status", function() {
                var getPet = mochaddt.utils.getSync({
                    path: `/pet/${id}`
                });

                assert.equal(getPet.body.id, id);
                assert.deepEqual(getPet.body.category, {
                    "id": 0,
                    "name": "string"
                });
                assert.equal(getPet.body.name, "mochaddt");
                assert.equal(getPet.body.photoUrls.length, 1);
                assert.equal(getPet.body.photoUrls[0], "string");
                assert.equal(getPet.body.tags.length, 1);
                assert.deepEqual(getPet.body.tags[0], {
                    "id": 0,
                    "name": "string"
                });
                assert.equal(getPet.body.status, "available");
            });

            it("will return 404 if id not found", function() {
                var getPet = mochaddt.utils.getSync({
                    path: "/pet/354243541"
                });

                assert.equal(getPet.statusCode, 404);
            });

            afterEach(function() {
                mochaddt.utils.deleteSync({
                    path: `/pet/${id}`
                });
            });
        });
    });
});