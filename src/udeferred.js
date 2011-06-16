/**
 * Copyright (c) 2011 David Mzareulyan
 *
 * μDeferred library
 * 
 */
(function() {

    var global = (function(){ return this; })();

    if (typeof global['jQuery'] !== "undefined" && typeof global['jQuery'].Deferred !== "undefined") {
        global.Deferred = global['jQuery'].Deferred;
        return;
    }

    /** @constructor */
    global.Deferred = function() {
        if (!(this instanceof arguments.callee)) return new global.Deferred();

        var     callbacks = [0, [], []],
                isFired = 0, // 1 - resolved, 2 - rejected
                args,
                promise = null,
                promiseMethods,
                deferred = this;

        var setStatus = function(type, newArgs, context) {
            if (isFired) return;
            isFired = type;
            args = newArgs;
            var list = callbacks[type];
            while (list.length) list.shift().apply(context, args);
            callbacks = null;
            return deferred;
        };
        var addCallback = function(onStatus, callback) {
            if (isFired == onStatus) {
                callback.apply(this, args);
            } else if (!isFired) {
                callbacks[onStatus].push(callback);
            }
            return this;
        };

        // Deferred object methods
        deferred.promise = function(target) {
            if (!target && promise) return promise;
            promise = target ? target : promise ? promise : {};
            for (var k in promiseMethods)
                if (promiseMethods.hasOwnProperty(k))
                    promise[k] = promiseMethods[k];
            return promise;
        };
        deferred.resolve = function() { return setStatus(1, arguments, promise); };
        deferred.reject  = function() { return setStatus(2, arguments, promise); };
        deferred.resolveWith = function() {
            var ctx = arguments.shift();
            return setStatus(1, arguments, ctx);
        };
        deferred.rejectWith = function() {
            var ctx = arguments.shift();
            return setStatus(2, arguments, ctx);
        };

        // Promise object methods
        promiseMethods = {
            done:   function(callback) { return addCallback.call(this, 1, callback); },
            fail:   function(callback) { return addCallback.call(this, 2, callback); },

            then:   function(callbackDone, callbackFail) {
                return this.done(callbackDone).fail(callbackFail);
            },
            always: function(callback) {
                return this.then(callback, callback);
            },

            isResolved: function() { return (isFired == 1); },
            isRejected: function() { return (isFired == 2); }
        };
    };

})();