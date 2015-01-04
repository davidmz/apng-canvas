apng-canvas v2
==============

([README по-русски](https://github.com/davidmz/apng-canvas/blob/master/README_RU.md))

Library to display Animated PNG ([Wikipedia](http://en.wikipedia.org/wiki/APNG), [specification](https://wiki.mozilla.org/APNG_Specification)) in a browser using canvas.

**Please note! API version 2 of the library is incompatible with the API version 1! **

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

API
-----------

The library creates a global object **APNG**, which has several methods.

All methods work asynchronously and return the object *ES6 Promise*. Most browsers have [built-in support](http://caniuse.com/#feat=promises) for it. 
For others browsers, library uses [polifill](https://github.com/jakearchibald/es6-promise) (included in the library).
If you have not worked before with Promises, then you should read the [review paper](http://www.html5rocks.com/en/tutorials/es6/promises/) about this technology. 
The method description includes values of the Promise result in cases where it is *fulfilled* or *rejected*.

### High-level methods

#### APNG.ifNeeded(\[ignoreNativeAPNG boolean\])
Checks whether there is a need to use the library.

**Fulfilled** (no value): The browser supports everything for the technology to work, but it does not support APNG. Usually
the library should only be used in this case.

If optional argument *ignoreNativeAPNG* is *true*, then native APNG support isn't tested.

**Rejected** (no value): The browser has native support for APNG (if *ignoreNativeAPNG* not used) or does not support all the necessary technologies for it to work.

#### APNG.animateImage(img HTMLImageElement)
Creates a `canvas` element where the APNG animation plays. The `img` element is removed from the DOM and replaced by `canvas`.
The `img` element attributes are preserved during replacement. If jQuery is present in the system, then the event handlers are preserved.

**Fulfilled** (no value): The `img` element is an APNG image.

**Rejected** (no value): The `img` element is not an APNG image, or there was an error when processing it. In this case the element is not replaced with `canvas`. 

### Low-level methods

#### APNG.checkNativeFeatures()
Checks which technologies are supported by the browser.

**Fulfilled** (Features): Returns the *Features* object with the following fields:

    {
        TypedArrays:    boolean
        BlobURLs:       boolean
        requestAnimationFrame: boolean
        pageProtocol:   boolean
        canvas:         boolean
        APNG:           boolean
    }

Each field has the value *true* or *false*. *True* means the browser has built-in support for the relevant technology. 
The `pageProtocol` field has the value *true* if the page is loaded over the *http* or *https* protocol (the library does not work on pages downloaded
over other protocols).

The library can work if all fields except APNG have the value `true`.

**Rejected**: N/A.

#### APNG.parseBuffer(data ArrayBuffer)
Parses binary data from the APNG-file.

**Fulfilled** (Animation): If the transmitted data are valid APNG, then the *Animation* object is returned with the following fields:

    {
        // Properties
        
        width:      int // image width
        height:     int // image height
        numPlays:   int // number of times to loop this animation.  0 indicates infinite looping.
        playTime:   int // time of full animation cycle in millisecond
        frames: [       // animation frames
            {
                width:  int // frame image width
                height: int // frame image height
                left:   int // frame image horizontal offset 
                top:    int // frame image vertical offset
                delay:  int // frame delay in millisecond
                disposeOp:  int // frame area disposal mode (see spec.)
                blendOp:    int // frame area blend mode (see spec.)
                img:    HTMLImageElement // frame image                   
            }
        ]
        
        // Methods
        
        isPlayed(): boolean     // is animation playing now?  
        isFinished(): boolean   // is animation finished (if numPlays <> 0)? 
        play()                  // play animation (if not playing and not finished)
        rewind()                // rewind animation to initial state and stop it
        addContext(CanvasRenderingContext2D)    // play animation on this canvas context 
                                                // (one animation may be played on many contexts)
    }

**Rejected** (string): The file is not valid APNG, or there was a parsing error. Returns a string with an error message.

#### APNG.parseURL(url string)
Downloads an image from the supplied URL and parses it.

**Fulfilled** (Animation): If the downloaded data are valid APNG, then the *Animation* object is returned (see *APNG.parseBuffer*).
The same *Animation* object is returned for the same URL.

**Rejected** (mixed): There was an error when downloading or parsing.

#### APNG.animateContext(url string, CanvasRenderingContext2D context)
Downloads an image from the supplied URL, parses it, and plays it in the given canvas environment.

**Fulfilled** (Animation): Similar to output of *APNG.parseURL*.

**Rejected** (mixed): There was an error when downloading or parsing.
