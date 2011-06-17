/**
 * @preserve
 * minimal logging library
 *
 * @author David Mzareulyan
 * @copyright 2011 David Mzareulyan
 * @license http://creativecommons.org/licenses/by/3.0/
 */
(function() {
    var global = (function(){ return this; })();

    var L = global.ULogger = function() {
        if (!(this instanceof arguments.callee)) return new L();

        var listeners = [];

        this.addListener = function(callback, minLevel) {
            if (!minLevel == "undefined") minLevel = L.LOG_INFO;
            listeners.push([minLevel, callback]);
        };

        this.log = function(message, level) {
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (level >= listener[0]) listener[1].call(null, message, level);
            }
        };
    };

    L.LOG_ALL   = 0;

    L.LOG_DEBUG3 = 98;
    L.LOG_DEBUG2 = 99;
    L.LOG_DEBUG = 100;
    L.LOG_INFO  = 101;
    L.LOG_WARNING  = 102;
    L.LOG_ERROR    = 103;
    L.LOG_FATAL    = 1000;

})();