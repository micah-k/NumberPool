/*jslint indent: 4, node: true, nomen: true */
/*global */

//
// createNumberPool
//
// Create a NumberPool object that manages a pool of numbers in a range through the methods allocate and release.
// The NumberPool object represents the pool of numbers ranging from one to ten million (1 to 10,000,000), unless 
// you pass a custom isze for testing.
//
exports.createNumberPool = function (size) {
    "use strict";

    // We trust that the user will not pass a value for size, since we don't document
    // one outside of this source file. If that changes we should validate that the
    // size passed in is a number and it's greater than 1. 
    var assert = require('assert'),
        _max = size || 10000000,
        _pool = [{begin: 1, end: _max}],
        //
        // _validRangeTest
        //
        // Throws an expection if the given range in not valid.
        //
        _validRangeTest = function (range) {
            if (typeof range !== 'object') { throw new Error("range is not an object"); }
            if (typeof range.begin !== 'number') { throw new Error("range.begin is not a number"); }
            if (typeof range.end !== 'number') { throw new Error("range.end is not a number"); }
            if (range.begin < 1 || range.begin > range.end) { throw new Error("range is inverted or not valid"); }
            if (range.begin !== Math.floor(range.begin)) { throw new Error("range.begin is not an integer"); }
            if (range.end !== Math.floor(range.end)) { throw new Error("range.end is not an integer"); }
        },
        //
        // _promoteToRange
        //
        // Helper that keeps other functions simple.
        //
        _promoteToRange = function (value) {
            if (typeof value === 'number') {
                value = {
                    begin: value,
                    end: value
                };
            }
            _validRangeTest(value);
            return value;
        },
        _promoteToRangeTests = function () {

            console.log("_promoteToRangeTests");

            assert.doesNotThrow(function () {
                _promoteToRange(1);
            });

            assert.throws(function () {
                _promoteToRange(false);
            }, Error);

            assert.throws(function () {
                _promoteToRange(/reg/);
            }, Error);

            assert.throws(function () {
                _promoteToRange(23.45);
            }, Error);

            assert.throws(function () {
                _promoteToRange({});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: true});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: 0, end: false});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: 0.5, end: 10});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: 1, end: 10.5});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: 0, end: 10});
            }, Error);

            assert.throws(function () {
                _promoteToRange({begin: 50, end: 10});
            }, Error);

            assert.doesNotThrow(function () {
                _promoteToRange({begin: 5, end: 10});
            });

            assert.doesNotThrow(function () {
                _promoteToRange({begin: 1, end: 10});
            });

            assert.doesNotThrow(function () {
                _promoteToRange({begin: 10, end: 10});
            });
        },
        //
        // _findBracket
        //
        // Returns a bracket where left is the index to the left of where
        // value belongs in the pool and right is the index to the right 
        // of where value belongs in the pool. If the value is in the pool
        // the left and right will be equal. If the value belongs at the 
        // beginning of the pool, left will be -1 and right will be 0. If
        // the value belongs at the end of the pool, then left will be the 
        // last index in the pool and right will be -1. 
        //
        // Loosely borrowed from the binary search algorithm found here. 
        // http://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
        //
        _findBracket = function (value) {
            var first = 0,
                last = _pool.length - 1,
                result = {
                    left:  first,
                    right: last
                },
                mid,
                candidate;

            if (last === -1) { throw new Error("Don't call _findBracket with an empty pool"); }

            while (result.left <= result.right) {
                // shifting is faster than dividing by two
                mid = (result.left + result.right) >> 1;
                candidate = _promoteToRange(_pool[mid]);
                if (candidate.end < value) {
                    result.left = mid + 1;
                } else if (candidate.begin > value) {
                    result.right = mid - 1;
                } else {
                    result.left = mid;
                    result.right = mid;
                    return result;
                }
            }

            if (result.left <= last && value < _promoteToRange(_pool[result.left]).begin) {
                result.right = result.left;
                result.left = result.right - 1;
                return result;
            }

            if (result.right >= first && value > _promoteToRange(_pool[result.right]).end) {
                result.left = result.right;
                result.right = result.left + 1;
                if (result.right > last) {
                    result.right = -1;
                }
                return result;
            }

            throw new Error("Failed to find a bracket\n" +
                "value = " + value + "\n" +
                "_pool = " + _pool + "\n" +
                "result.left = " + result.left + "\n" +
                "result.right = " + result.right + "\n");
        },
        _findBracketTests = function () {
            var oldPool = _pool;

            _pool = [];

            console.log("_findBracketTests");

            assert.throws(function () {
                _findBracket(1);
            }, Error);

            _pool = [10];

            assert.doesNotThrow(function () {
                assert.deepEqual(_findBracket(1), {left: -1, right: 0});
                assert.deepEqual(_findBracket(20), {left: 0, right: -1});
                assert.deepEqual(_findBracket(10), {left: 0, right: 0});
            });

            _pool = [10, 20];

            assert.doesNotThrow(function () {
                assert.deepEqual(_findBracket(5), {left: -1, right: 0});
                assert.deepEqual(_findBracket(10), {left: 0, right: 0});
                assert.deepEqual(_findBracket(15), {left: 0, right: 1});
                assert.deepEqual(_findBracket(20), {left: 1, right: 1});
                assert.deepEqual(_findBracket(25), {left: 1, right: -1});
            });

            _pool = [10, 20, 30];

            assert.doesNotThrow(function () {
                assert.deepEqual(_findBracket(5), {left: -1, right: 0});
                assert.deepEqual(_findBracket(10), {left: 0, right: 0});
                assert.deepEqual(_findBracket(15), {left: 0, right: 1});
                assert.deepEqual(_findBracket(20), {left: 1, right: 1});
                assert.deepEqual(_findBracket(25), {left: 1, right: 2});
                assert.deepEqual(_findBracket(30), {left: 2, right: 2});
                assert.deepEqual(_findBracket(35), {left: 2, right: -1});
            });

            _pool = [
                {begin: 5, end: 10},
                {begin: 11, end: 20},
                {begin: 21, end: 30},
                {begin: 31, end: 40},
                {begin: 41, end: 45}
            ];

            assert.doesNotThrow(function () {
                assert.deepEqual(_findBracket(1), {left: -1, right: 0});
                assert.deepEqual(_findBracket(5), {left: 0, right: 0});
                assert.deepEqual(_findBracket(10), {left: 0, right: 0});
                assert.deepEqual(_findBracket(11), {left: 1, right: 1});
                assert.deepEqual(_findBracket(20), {left: 1, right: 1});
                assert.deepEqual(_findBracket(21), {left: 2, right: 2});
                assert.deepEqual(_findBracket(30), {left: 2, right: 2});
                assert.deepEqual(_findBracket(31), {left: 3, right: 3});
                assert.deepEqual(_findBracket(40), {left: 3, right: 3});
                assert.deepEqual(_findBracket(41), {left: 4, right: 4});
                assert.deepEqual(_findBracket(45), {left: 4, right: 4});
                assert.deepEqual(_findBracket(50), {left: 4, right: -1});
            });

            _pool = [
                {begin: 5, end: 9},
                {begin: 11, end: 19},
                {begin: 21, end: 29},
                {begin: 31, end: 39},
                {begin: 41, end: 45}
            ];

            assert.doesNotThrow(function () {
                assert.deepEqual(_findBracket(1), {left: -1, right: 0});
                assert.deepEqual(_findBracket(5), {left: 0, right: 0});
                assert.deepEqual(_findBracket(7), {left: 0, right: 0});
                assert.deepEqual(_findBracket(9), {left: 0, right: 0});
                assert.deepEqual(_findBracket(10), {left: 0, right: 1});
                assert.deepEqual(_findBracket(11), {left: 1, right: 1});                
                assert.deepEqual(_findBracket(19), {left: 1, right: 1});
                assert.deepEqual(_findBracket(20), {left: 1, right: 2});
                assert.deepEqual(_findBracket(21), {left: 2, right: 2});
                assert.deepEqual(_findBracket(29), {left: 2, right: 2});
                assert.deepEqual(_findBracket(30), {left: 2, right: 3});
                assert.deepEqual(_findBracket(31), {left: 3, right: 3});
                assert.deepEqual(_findBracket(39), {left: 3, right: 3});
                assert.deepEqual(_findBracket(40), {left: 3, right: 4});
                assert.deepEqual(_findBracket(41), {left: 4, right: 4});
                assert.deepEqual(_findBracket(45), {left: 4, right: 4});
                assert.deepEqual(_findBracket(50), {left: 4, right: -1});
            });

            _pool = oldPool;
        },
        //
        // _mergeEnd
        //
        // Attempts to merge the end of the range at the 
        // given index with the number provided.
        // Returns true if successful, otherwise false.
        //
        _mergeEnd = function (number, index) {
            var range = _promoteToRange(_pool[index]);

            if (range.end + 1 === number) {
                range.end = number;
                _pool[index] = range;
                return true;
            }
            return false;
        },
        _mergeEndTests = function () {
            var oldPool = _pool;

            _pool = [10];

            assert.doesNotThrow(function () {
                assert.stricitEqual(_mergeEnd(1, 0))
                assert.deepEqual(_findBracket(1), {left: -1, right: 0});
                assert.deepEqual(_findBracket(20), {left: 0, right: -1});
                assert.deepEqual(_findBracket(10), {left: 0, right: 0});
            });

            _pool = oldPool;
        },
        //
        // _mergeBegin
        //
        // Attempts to merge the begin of the range at the 
        // given index with the number provided.
        // Returns true if successful, otherwise false.
        //
        _mergeBegin = function (number, index) {
            var range = _promoteToRange(_pool[index]);

            if (number + 1 === range.begin) {
                range.begin = number;
                _pool[index] = range;
                return true;
            }
            return false;
        };

    return {
        //
        // allocate
        //
        // returns a number from the pool of available numbers
        // if no more numbers are available, returns 0
        //
        // Design:
        //
        // We always feed from the back to minimize array copies.
        //
        allocate: function () {
            var lastIndex = _pool.length - 1,
                result = 0;

            if (_pool.length === 0) {
                // If the pool is empty then 
                // all numbers have been allocated
                return result;
            }
            if (typeof _pool[lastIndex] === 'number') {
                result = _pool.pop();
            } else {
                result = _pool[lastIndex].end;
                _pool[lastIndex].end -= 1;
                // demote ranges of one number to single numbers to save space
                if (_pool[lastIndex].end === _pool[lastIndex].begin) {
                    _pool[lastIndex] = _pool[lastIndex].begin;
                }
            }
            return result;
        },
        //
        // release
        //
        // adds an available number value back to the pool. 
        // If the value is successfully added back to the pool, 
        // returns true. If the value is already in the pool, 
        // returns false.
        //
        release: function (number) {
            var bracket, rangeLeft, rangeRight;

            if (number < 0 || number > _max) {
                return false;
            }

            bracket = _findBracket(number);

            if (bracket.left === bracket.right) {
                return false;
            }

            if (bracket.left === -1) {
                if (!_mergeBegin(number, bracket.right)) {
                    _pool.splice(0, 0, number);
                }
                return true;
            }

            if (bracket.right === -1) {
                if (!_mergeEnd(number, bracket.left)) {
                    _pool.push(number);
                }
                return true;
            }                

            if (_mergeEnd(number, bracket.left) && _mergeBegin(number, bracket.right)) {
                _pool[bracket.left].end = _pool[bracket.right].end;
                _pool.splice(bracket.right, 1);
            }
            return true;
        },
        internalTests: function () {
            _promoteToRangeTests();
            _findBracketTests();
        },
        dumpPool: function () {
            console.log(_pool);
        }
    };
};
