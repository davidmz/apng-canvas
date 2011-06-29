APNG-canvas
==============

([README по-русски](https://github.com/davidmz/apng-canvas/blob/master/README_RU.md))

APNG-canvas is a library for displaing Animated PNG files in the browsers with canvas support (Google Chrome, Internet Explorer 9, Apple Safari).

Working demo: http://davidmz.github.com/apng-canvas/ (around 3 Mb of apng files)

Discussion in LJ: http://david-m.livejournal.com/tag/apng-canvas (in russain)

API
-----------

The library creates a global object **APNG**, which has several methods. All methods are asynchronous and most of them receive an optional callback-argument. Methods must be called after DOM tree is loaded.

For deferred calls, these methods return *promise* objects. If jQuery is available, then its [promises](http://api.jquery.com/category/deferred-object/) are used, in other case a compatible interface which supports methods `done`, `fail`, `then` and `always` is used. If the method is finished successfully, `callback` and `done` handlers are called (with the same parameters), in case of error `fail` hendlers are called with the error message.

### APNG.ifNeeded(callback?)

The `callback` is called without arguments, and only when browser supports `canvas` but not `APNG`. Only in that case it makes sense to use this library.
Other methods (except `checkNativeFeatures`) should be called from the `callback`.

### APNG.animateImage(img)

This method is called without `callback`. If `img.src` contains a link to the correct APNG file, then this methods creates `canvas`, in which APNG animations would be played.
Then the method selects optimal strategy for animaton depending on the browser:

*   For WebKit-based broswers (Chrome and Safari):
    source image is replaced by a transparent gif plus background canvas where the animation is played.
    That allows to keep the `img` object, its attributes and event handlers.
*   For other browsers (Internet Explorer 9):
    Works similar to the `replaceImage` method (below): source image `img` is replaced with `canvas` animation object.

### APNG.replaceImage(img)

This method is called without `callback`. Replaces `img` element (`HTMLImageElement`) with `canvas` animation. Replacement only works when `img` contains correct PNG file. The replacement keeps the attributes of `img`. If jQuery is available, than event handlers are kept too.

This method works the same in all browsers.

### APNG.createAPNGCanvas(url, callback?)

Loads PNG file from that `url` and disassembles it, then creates `canvas` element and starts the animation.

The `callback` is only called when the loaded data contains the correct APNG file. The argument is newly created `canvas` animation element. This element is not a part of the DOM tree, it have to be added manually.

### APNG.checkNativeFeatures(callback?)

Checks if the browser supports `APNG` and `canvas`. Can be called independently from all other methods. The `callback` argument is the objects with two binary fields: `apng` and `canvas`. `True` in those fields means the browser supports correcponding technology.


Usage example
-------------

    APNG.ifNeeded(function() {
        for (var i = 0; i < document.images.length; i++) {
            var img = document.images[i];
            if (/\.png$/i.test(img.src)) APNG.animateImage(img);
        }
    });


Limitations
-----------

Since the images are loaded by `XMLHttpRequest`, the images domain should be the same as the webpage domain.

If domains are different, then in Chrome/Safari it is possible to use [CORS](http://www.w3.org/TR/cors/ "Cross-Origin Resource Sharing"), by making sure the image server returns `Access-Control-Allow-Origin: *` header.

Unfortunately, it seems that CORS cannot by used in IE, because the corresponding object `XDomainRequest` will not return the result as binary data (`XMLHttpRequest` allows that by using `responseBody` property).

By the same reason (the use of `XMLHttpRequest`), the library will not work locally, with file:// protocol.

-----------------------------------

Thanks to Max Stepin for the translation of this README.