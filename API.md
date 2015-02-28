# API

#### APNG.ifNeeded(\[ignoreNativeAPNG boolean\])
Checks whether there is a need to use the library.

**Fulfilled** (no value): The browser supports everything for the technology to work, but it does not support APNG. Usually
the library should only be used in this case.

If optional argument *ignoreNativeAPNG* is *true*, then native APNG support isn't tested.

**Rejected** (no value): The browser has native support for APNG (if *ignoreNativeAPNG* not used) or does not support all the necessary technologies for it to work.

#### APNG.animateImage(img HTMLImageElement)
Creates a `canvas` element where the APNG animation plays. The `img` element is removed from the DOM and replaced by `canvas`.
The `img` element attributes are preserved during replacement.

**Fulfilled** (no value): The `img` element is an APNG image.

**Rejected** (no value): The `img` element is not an APNG image, or there was an error when processing it. In this case the element is not replaced with `canvas`. 

#### APNG.releaseCanvas(canvas HTMLCanvasElement)
Detaches `canvas` from animation loop. May be useful for dynamic created APNG-images.
This is a synchronous method, it does not return a result.

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
        removeContext(CanvasRenderingContext2D) // remove context from animation
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
