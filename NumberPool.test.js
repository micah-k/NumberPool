/*jslint indent: 4, node: true, nomen: true */
/*global */

var argv = process.argv,
    argc = argv.length,
    npf = require("./NumberPool.js"),
    main = function (argc, argv) {
        "use strict";

        var np = npf.createNumberPool(10),
            results = [];

        results.push(np.allocate());
        console.log(results);

        console.log(np.release(1));

        np.dumpPool();
    };

main(argc, argv);

