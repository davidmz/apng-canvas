"use strict";

var Promise = Promise || require('es6-promise').Promise;

var oncePromise = function (foo) {
    var promise = null;
    return function (callback) {
        if (!promise) promise = new Promise(foo);
        if (callback) promise.then(callback);
        return promise;
    };
};

var checkNativeFeatures = oncePromise(function (resolve) {
    var canvas = document.createElement("canvas");
    var result = {
        TypedArrays: ("ArrayBuffer" in global),
        BlobURLs: ("URL" in global),
        requestAnimationFrame: ("requestAnimationFrame" in global),
        pageProtocol: (location.protocol == "http:" || location.protocol == "https:"),
        canvas: ("getContext" in document.createElement("canvas")),
        APNG: false
    };

    if (result.canvas) {
        // see http://eligrey.com/blog/post/apng-feature-detection
        var img = new Image();
        img.onload = function () {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            result.APNG = (ctx.getImageData(0, 0, 1, 1).data[3] === 0);
            resolve(result);
        };
        // frame 1 (skipped on apng-supporting browsers): [0, 0, 0, 255]
        // frame 2: [0, 0, 0, 0]
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjV" +
        "EwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAA" +
        "AAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
    } else {
        resolve(result);
    }
});

/**
 * @param {boolean} [ignoreNativeAPNG]
 * @return {Promise}
 */
var ifNeeded = function (ignoreNativeAPNG) {
    if (typeof ignoreNativeAPNG == 'undefined') ignoreNativeAPNG = false;
    return checkNativeFeatures().then(function (features) {
        if (features.APNG && !ignoreNativeAPNG) {
            reject();
        } else {
            var ok = true;
            for (var k in features) if (features.hasOwnProperty(k) && k != 'APNG') {
                ok = ok && features[k];
            }
        }
    });
};

module.exports = {
    checkNativeFeatures: checkNativeFeatures,
    ifNeeded: ifNeeded
};
