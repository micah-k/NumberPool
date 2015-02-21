/*jslint indent: 4, node: true, nomen: true */
/*global */

exports.createNumberPool = function (size) {
    "use strict";

    var _max = size || 10000000,
        _pool = [{start: 1, end: _max}];
    return {
        allocate: function () {
            return 1;
        },
        release: function (number) {
            return number > 0;
        },
        dumpPool: function () {
            console.log(_pool);
        }
    };
};

