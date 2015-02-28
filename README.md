apng-canvas v2.1.0
==============

([README по-русски](https://github.com/davidmz/apng-canvas/blob/master/README_RU.md))

Library to display Animated PNG ([Wikipedia](http://en.wikipedia.org/wiki/APNG), [specification](https://wiki.mozilla.org/APNG_Specification)) in a browser using canvas.

Working demo: https://davidmz.github.io/apng-canvas/ (around 3 Mb of apng files)

**Please note! API version 2 of the library is incompatible with the API version 1!**

The library requires support from the following technologies in order to run:

 * [Canvas](http://caniuse.com/#feat=canvas)
 * [Typed Arrays](http://caniuse.com/#feat=typedarrays)
 * [Blob URLs](http://caniuse.com/#feat=bloburls)
 * [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)
 
These technologies are supported in all modern browsers and IE starting with version 10.


Some browsers (at the moment these are Firefox and Safari 8+) have [native support for APNG](http://caniuse.com/#feat=apng). 
This library is not required for these browsers.

Usage example
-----------

```javascript
APNG.ifNeeded().then(function() {
    var images = document.querySelectorAll(".apng-image");
    for (var i = 0; i < images.length; i++) APNG.animateImage(images[i]);
});
```

Limitations
-----------

Images are loaded using `XMLHttpRequest`, therefore, the HTML page and APNG image must be located on the same domain
or the correct [CORS](http://www.w3.org/TR/cors/ "Cross-Origin Resource Sharing") header should be provided
(for example, `Access-Control-Allow-Origin: *`).
For the same reason, the library will not work on a local machine (using the protocol `file://`).

**Important note!** Compression proxies (turbo mode in Opera, "reduce data usage" mode in mobile Chrome, etc.), doesn't know about
APNG format. These proxies transforms APNGs into static images. To prevent it for *your* images, they need to be served with 
`Cache-Control: no-transform` HTTP header (see [big article](http://calendar.perfplanet.com/2013/mobile-isp-image-recompression/) about such proxies),
or via HTTPS.


API
-----------

The library creates a global object **APNG**, which has several methods.

High-level methods:

* [APNG.ifNeeded](API.md#user-content-apngifneededignorenativeapng-boolean)
* [APNG.animateImage](API.md#user-content-apnganimateimageimg-htmlimageelement)
* [APNG.releaseCanvas](API.md#user-content-apngreleasecanvascanvas-htmlcanvaselement)

Low-level methods:

* [APNG.checkNativeFeatures](API.md#user-content-apngchecknativefeatures)
* [APNG.parseBuffer](API.md#user-content-apngparsebufferdata-arraybuffer)
* [APNG.parseURL](API.md#user-content-apngparseurlurl-string)
* [APNG.animateContext](API.md#user-content-apnganimatecontexturl-string-canvasrenderingcontext2d-context)

Most methods work asynchronously and return the ES6 *Promise* object. Most browsers have [built-in support](http://caniuse.com/#feat=promises) for it. 
For others browsers, library uses [polifill](https://github.com/jakearchibald/es6-promise) (included in the library).
If you have not worked before with Promises, then you should read the [review paper](http://www.html5rocks.com/en/tutorials/es6/promises/) about this technology. 
The method description includes values of the Promise result in cases where it is *fulfilled* or *rejected*.

Build instructions
-----------

    npm install
    gulp build