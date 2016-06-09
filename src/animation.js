"use strict";

/**
 * Animation class
 * @constructor
 */
var Animation = function () {
    // Public

    this.width = 0;
    this.height = 0;
    this.numPlays = 0;
    this.playTime = 0;
    this.frames = [];

    /**
     * Play animation (if not finished)
     * @return {void}
     */
    this.play = function () {
        if (played || finished) return;
        this.rewind();
        played = true;
        requestAnimationFrame(tick);
    };

    /**
     * Rewind animation to start (and stop it)
     * @return {void}
     */
    this.rewind = function () {
        nextRenderTime = 0;
        fNum = 0;
        prevF = null;
        played = false;
        finished = false;
    };

    /**
     * Add new canvas context to animate
     * @param {CanvasRenderingContext2D} ctx
     * @return {void}
     */
    this.addContext = function (ctx) {
        if (contexts.length > 0) {
            var dat = contexts[0].getImageData(0, 0, this.width, this.height);
            ctx.putImageData(dat, 0, 0);
        }
        contexts.push(ctx);
        ctx['_apng_animation'] = this;
    };

    /**
     * Remove canvas context from animation
     * @param {CanvasRenderingContext2D} ctx
     * @return {void}
     */
    this.removeContext = function (ctx) {
        var idx = contexts.indexOf(ctx);
        if (idx === -1) {
            return;
        }
        contexts.splice(idx, 1);
        if (contexts.length === 0) {
            this.rewind();
        }
        if ('_apng_animation' in ctx) {
            delete ctx['_apng_animation'];
        }
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Is animation played?
     * @return {boolean}
     */
    this.isPlayed = function () { return played; };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Is animation finished?
     * @return {boolean}
     */
    this.isFinished = function () { return finished; };

    // Private

    var ani = this,
        nextRenderTime = 0,
        fNum = 0,
        prevF = null,
        played = false,
        finished = false,
        contexts = [];

    var tick = function (now) {
        while (played && nextRenderTime <= now) renderFrame(now);
        if (played) requestAnimationFrame(tick);
    };

    var renderFrame = function (now) {
        var f = fNum++ % ani.frames.length;
        var frame = ani.frames[f];

        if (f == 0) {
            contexts.forEach(function (ctx) {ctx.clearRect(0, 0, ani.width, ani.height);});
            prevF = null;
            if (frame.disposeOp == 2) frame.disposeOp = 1;
        }

        if (prevF && prevF.disposeOp == 1) {
            contexts.forEach(function (ctx) {ctx.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);});
        } else if (prevF && prevF.disposeOp == 2) {
            contexts.forEach(function (ctx) {ctx.putImageData(prevF.iData, prevF.left, prevF.top);});
        }
        prevF = frame;
        prevF.iData = null;
        if (prevF.disposeOp == 2) {
            prevF.iData = contexts[0].getImageData(frame.left, frame.top, frame.width, frame.height);
        }
        if (frame.blendOp == 0) {
            contexts.forEach(function (ctx) {ctx.clearRect(frame.left, frame.top, frame.width, frame.height);});
        }
        contexts.forEach(function (ctx) {ctx.drawImage(frame.img, frame.left, frame.top);});

        if (ani.numPlays == 0 || fNum / ani.frames.length < ani.numPlays) {
            if (nextRenderTime == 0) nextRenderTime = now;
            while (now > nextRenderTime + ani.playTime) nextRenderTime += ani.playTime;
            nextRenderTime += frame.delay;
        } else {
            played = false;
            finished = true;
        }
    };
};

module.exports = Animation;
