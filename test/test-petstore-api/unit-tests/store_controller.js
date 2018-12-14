const mochaddt = require("../../../index");
const assert = require("chai").assert;

function deleteOrder(id) {
    mochaddt.utils.deleteSync({
        path: `/store/order/${id}`
    });
}


describe("unit tests", function() {
    describe("store", function() {
        describe("POST /store/order", function() {
            this.timeout(10000);
            it("will create an order with correct status", function() {
                var status = mochaddt.input(this, "status", "placed");
                var createOrder = mochaddt.utils.postSync({
                    path: "/store/order",
                    body: {
                        "id": 0,
                        "petId": 0,
                        "quantity": 1,
                        "shipDate": "2018-12-11T13:48:31.403Z",
                        "status": status,
                        "complete": false
                    }
                });
                var getOrder = mochaddt.utils.getSync({
                    path: `/store/order/${createOrder.body.id}`
                });
                assert(createOrder.body.status);
                assert(getOrder.body.status);
                assert.equal(createOrder.body.status, getOrder.body.status);
                deleteOrder(0);
            });

            it("will create an order with correct id", function() {
                var id = mochaddt.input(this, "id", "1");
                var createOrder = mochaddt.utils.postSync({
                    path: "/store/order",
                    body: {
                        "id": id,
                        "petId": 0,
                        "quantity": 1,
                        "shipDate": "2018-12-11T13:48:31.403Z",
                        "status": "placed",
                        "complete": false
                    }
                });
                var getOrder = mochaddt.utils.getSync({
                    path: `/store/order/${createOrder.body.id}`
                });
                assert(createOrder.body.id);
                assert(getOrder.body.id);
                assert.equal(createOrder.body.id, getOrder.body.id);
                deleteOrder(id);
            });
        });
    });
});