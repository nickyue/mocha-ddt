const mochaddt = require('../../index');
const assert = require('chai').assert;

describe('Array', function() {
    describe('unit testing', function() {
        it('#indexOf', function() {
            var array = mochaddt.input(this, "array");
            var element = mochaddt.input(this, "element");
            var expected = mochaddt.input(this, 'expected');
            assert.equal(array.indexOf(element), expected);
        });

        describe('#push', function() {
            var array;
            var element;
            beforeEach(function() {
                array = mochaddt.input(this, "array");
                element = mochaddt.input(this, "element");
            });
            it('should increase array length by 1', function() {
                var length = array.length;
                array.push(element);
                assert.equal(array.length, length + 1);
                mochaddt.output(this, length);
            });
            it('should append the element to array', function() {
                var originalLength = mochaddt.fetch(this, "should increase array length by 1");
                assert.equal(array.length, originalLength);
                array.push(element);
                assert.equal(array[array.length - 1], element);
            });
        });
    });
});