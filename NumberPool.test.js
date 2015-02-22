/*jslint indent: 4, node: true, nomen: true */
/*global */

var argv = process.argv,
    argc = argv.length,
    assert = require('assert'),
    npf = require("./NumberPool.js"),
    equalArrays = function (arr1, arr2) {
        "use strict";

        var i = 0;

        if (typeof arr1 !== 'object') {
            return false;
        } 
        if (typeof arr2 !== 'object') {
            return false;
        }
        if (arr1.length === arr2.length) {
            for (i = 0; i < arr1.length; i += 1) {
                if (typeof arr1[i] !== typeof arr2[i]) {
                    return false;
                }
                if (typeof arr1[i] === 'number' && arr1[i] !== arr2[i]) {
                        return false;
                }
                if (typeof arr1[i] === 'object' && (arr1[i].begin !== arr2[i].begin || arr1[i].end !== arr2[i].end)) {
                        return false;
                }
            }
            return true;
        }
       return false;
    },
    main = function (argc, argv) {
        "use strict";

        var np = npf.createNumberPool(10),
            results = [1,3],
            r = [1,3];

        np.internalTests();

        assert.deepEqual([1,3], [1,3]);
        assert.deepEqual([1,{b:3,e:8}, 10],[1,{b:3,e:8}, 10]);
        console.log(equalArrays(results, r));

        console.log(results.length);
        
        console.log(results);

        results.splice(0, 2, {s:1,e:3});

        console.log(equalArrays(results, r));
        
        console.log(results);

    };

main(argc, argv);

