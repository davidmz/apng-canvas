(function() {
    /************************* PUBLIC ***************************/

    self.APNG = {};

    self.APNG.checkNativeFeatures = function(callback) {
        /* Блок для однократного исполнения метода */
        var firstCall = !arguments.callee.d;
        var d = firstCall ? (arguments.callee.d = new Deferred()) : arguments.callee.d;
        if (callback) d.promise().done(function(res) { callback(res); });
        if (!firstCall) return d.promise();

        var res = { canvas: false, apng: false };
        var canvas = document.createElement("canvas");
        if (typeof canvas.getContext == "undefined") {
            // canvas is not supported
            d.resolve(res);
        } else {
            // canvas is supported
            res.canvas = true;
            // see http://eligrey.com/blog/post/apng-feature-detection
            var img = new Image();
            img.onload = function() {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                if (ctx.getImageData(0, 0, 1, 1).data[3] === 0 ) {
                    res.apng = true;
                    d.resolve(res);
                } else {
                    d.resolve(res);
                }
            };
            // frame 1 (skipped on apng-supporting browsers): [0, 0, 0, 255]
            // frame 2: [0, 0, 0, 0]
            img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
        }
        return d.promise();
    };

    self.APNG.ready = function(callback) {
        /* Блок для однократного исполнения метода */
        var firstCall = !arguments.callee.d;
        var d = firstCall ? (arguments.callee.d = new Deferred()) : arguments.callee.d;
        if (callback) d.promise().done(callback);
        if (!firstCall) return d.promise();

        this.checkNativeFeatures().done(function(f) {
            if (f.canvas && !f.apng) {
                // Если всё хорошо, то создаём VBScript-функцию для IE9
                // see http://miskun.com/javascript/internet-explorer-and-binary-files-data-access/
                if (typeof XMLHttpRequest.prototype.responseBody != "undefined") {
                    var script = document.createElement("script");
                    script.setAttribute('type','text/vbscript');
                    script.text =   "Function IEBinaryToBinStr(Binary)\r\n" +
                                    "   IEBinaryToBinStr = CStr(Binary)\r\n" +
                                    "End Function\r\n";
                    document.body.appendChild(script);
                }
                d.resolve();
            } else {
                d.reject();
            }
        }).done(function() { d.reject(); });
        return d.promise();
    };

    self.APNG.createAPNGCanvas = function(url, callback) {
        var d = new Deferred();
        if (callback) d.promise().done(callback);
        loadBinary(url)
                .done(function(imageData) {
                    parsePNGData(imageData)
                            .done(function(aPng) {
                                var canvas = document.createElement("canvas");
                                canvas.width = aPng.width;
                                canvas.height = aPng.height;
                                if (aPng.isAnimated) {
                                    animate(aPng, canvas);
                                } else {
                                    var img = new Image();
                                    img.onload = function() { canvas.getContext('2d').drawImage(img, 0, 0); };
                                    var db = new DataBuilder();
                                    db.append(imageData);
                                    img.src = db.getUrl("image/png");
                                }
                                d.resolve(canvas);
                            })
                            .fail(function(reason) {
                                d.reject(reason);
                            });
                })
                .fail(function(reason) {
                    d.reject(reason);
                });

        return d.promise();
    };

    self.APNG.replaceImage = function(img) {
        return APNG.createAPNGCanvas(img.src).done(function(canvas) {
            img.parentNode.insertBefore(canvas, img);
            img.parentNode.removeChild(img);
        });
    };

    /************************* HELPERS ***************************/

    var PNG_SIGNATURE = "\x89PNG\x0d\x0a\x1a\x0a";

    var crc32 = function(str) {
        var table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D];
        var crc = -1;
        for( var i = 0, l = str.length; i < l; i++ )
            crc = ( crc >>> 8 ) ^ table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
        return crc ^ (-1);
    };

    var readDWord = function(data) {
        var x = 0;
        for (var i = 0; i < 4; i++) x += (data.charCodeAt(i) << ((3 - i) * 8));
        return x;
    };

    var readWord = function(data) {
        var x = 0;
        for (var i = 0; i < 2; i++) x += (data.charCodeAt(i) << ((1 - i) * 8));
        return x;
    };

    var writeChunk = function(type, data) {
        var res = "";
        res += writeDWord(data.length);
        res += type;
        res += data;
        res += writeDWord(crc32(type + data));
        return res;
    };

    var writeDWord = function(num) {
        return String.fromCharCode(
                ((num >> 24) & 0xff),
                ((num >> 16) & 0xff),
                ((num >> 8) & 0xff),
                (num & 0xff)
        );
    };

    var DataBuilder = function() {
        this.parts = [];
    };
    DataBuilder.prototype.append = function(data) {
        this.parts.push(data);
    };
    DataBuilder.prototype.getUrl = function(contentType) {
        return "data:" + contentType + "," + escape(this.parts.join(""));
    };

    var Deferred;
    if (typeof jQuery != "undefined" && typeof jQuery.Deferred != "undefined") {
        Deferred = jQuery.Deferred;
    } else {
        /**
         * Custom Deferred implementation
         * @constructor
         */
        Deferred = function() {
            this.doneList = [];
            this.failList = [];
            this._isResolved = false;
            this._isRejected = false;
            this.args = null;
        };
        Deferred.prototype.promise = function() { return this; };
        Deferred.prototype.done = function(callback) {
            if (this._isResolved) {
                callback.apply(this, this.args);
            } else if (!this._isRejected) {
                this.doneList.push(callback);
            }
            return this;
        };
        Deferred.prototype.fail = function(callback) {
            if (this._isRejected) {
                callback.apply(this, this.args);
            } else if (!this._isResolved) {
                this.failList.push(callback);
            }
            return this;
        };
        Deferred.prototype.then = function(callbackDone, callbackFail) {
            return this.done(callbackDone).fail(callbackFail);
        };
        Deferred.prototype.always = function(callback) {
            return this.then(callback, callback);
        };
        Deferred.prototype.isResolved = function() { return this._isResolved; };
        Deferred.prototype.isRejected = function() { return this._isRejected; };
        Deferred.prototype.resolve = function() {
            if (!this._isRejected && !this._isResolved) {
                this._isResolved = true;
                this.args = arguments;
                while (this.doneList.length) this.doneList.shift().apply(this, this.args);
                this.failList = [];
            }
            return this;
        };
        Deferred.prototype.reject = function() {
            if (!this._isRejected && !this._isResolved) {
                this._isRejected = true;
                this.args = arguments;
                while (this.failList.length) this.failList.shift().apply(this, this.args);
                this.doneList = [];
            }
            return this;
        };
    }

    /************************* INTERNALS ***************************/

    /**
     * Загрузка двоичных данных как строки с символами \x00 - \xff
     * @param url
     */
    var loadBinary = function(url) {
        var d = new Deferred();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        if (typeof xhr.responseType != "undefined") { // chrome
            xhr.responseType = "arraybuffer";
        } else if (typeof xhr.overrideMimeType != "undefined") { // FF?
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
        xhr.onreadystatechange = function(e) {
            if (this.readyState == 4 && this.status == 200) {
                if (typeof this.response != "undefined") { // XHR 2
                    var bb = new (self.BlobBuilder || self.WebKitBlobBuilder)();
                    bb.append(this.response);
                    var reader = new FileReader();
                    reader.onload = function() { d.resolve(this.result); };
                    reader.readAsBinaryString(bb.getBlob());
                } else {
                    var res = "";
                    if (typeof this.responseBody != "undefined") { // IE
                        // see http://miskun.com/javascript/internet-explorer-and-binary-files-data-access/
                        var raw = IEBinaryToBinStr(this.responseBody);
                        for (var j = 0, l = raw.length; j < l; j++) {
                            var c = raw.charCodeAt(j);
                            res += String.fromCharCode(c & 0xFF, (c >> 8) & 0xFF);
                        }
                    } else { // FF?
                        var binStr = this.responseText;
                        for (var i = 0, len = binStr.length; i < len; ++i)
                            res += String.fromCharCode(binStr.charCodeAt(i) & 0xff);
                    }
                    d.resolve(res);
                }
            } else if (this.readyState == 4) {
                d.reject(xhr);
            }
        };
        xhr.send();

        return d.promise();
    };

    var parsePNGData = function(imageData) {
        var d = new Deferred();

        if (imageData.substr(0, 8) != PNG_SIGNATURE) {
            d.reject("Invalid PNG file signature");
            return d.promise();
        }

        var aPng = {
            width:  0,
            height: 0,
            isAnimated: false,
            numPlays:   0,
            frames: []
        };

        var headerData, preData = "", postData = "";

        var off = 8, frame = null;
        do {
            var length = readDWord(imageData.substr(off, 4));
            var type = imageData.substr(off + 4, 4);
            var data;

            switch (type) {
                case "IHDR":
                    data = imageData.substr(off + 8, length);
                    headerData = data;
                    aPng.width = readDWord(data.substr(0, 4));
                    aPng.height = readDWord(data.substr(4, 4));
                    break;
                case "acTL":
                    aPng.isAnimated = true;
                    aPng.numPlays = readDWord(imageData.substr(off + 8 + 4, 4));
                    break;
                case "fcTL":
                    if (frame) aPng.frames.push(frame);
                    data = imageData.substr(off + 8, length);
                    frame = {};
                    frame.width     = readDWord(data.substr(4, 4));
                    frame.height    = readDWord(data.substr(8, 4));
                    frame.left      = readDWord(data.substr(12, 4));
                    frame.top       = readDWord(data.substr(16, 4));
                    var delayN    = readWord(data.substr(20, 2));
                    var delayD    = readWord(data.substr(22, 2));
                    if (delayD == 0) delayD = 100;
                    frame.delay = 1000 * delayN / delayD;
                    frame.disposeOp = data.charCodeAt(24);
                    frame.blendOp   = data.charCodeAt(25);
                    frame.dataParts = [];
                    break;
                case "fdAT":
                    if (frame) frame.dataParts.push(imageData.substr(off + 8 + 4, length - 4));
                    break;
                case "IDAT":
                    if (frame) frame.dataParts.push(imageData.substr(off + 8, length));
                    break;
                case "IEND":
                    postData = imageData.substr(off, length + 12);
                    break;
                default:
                    preData += imageData.substr(off, length + 12);
            }
            off += 12 + length;
        } while(type != "IEND" && off < imageData.length);
        if (frame) aPng.frames.push(frame);

        // Вариант неанимированного PNG
        if (!aPng.isAnimated) d.resolve(aPng);

        // Собираем кадры
        var loadedImages = 0;
        for (var i = 0; i < aPng.frames.length; i++) {
            var img = new Image();
            frame = aPng.frames[i];
            frame.img = img;
            img.onload = function() {
                loadedImages++;
                if (loadedImages == aPng.frames.length) d.resolve(aPng);
            };
            img.onerror = function() { d.reject("Image creation error"); };

            var db = new DataBuilder();
            db.append(PNG_SIGNATURE);
            headerData = writeDWord(frame.width) + writeDWord(frame.height) + headerData.substr(8);
            db.append(writeChunk("IHDR", headerData));
            db.append(preData);
            for (var j = 0; j < frame.dataParts.length; j++) {
                db.append(writeChunk("IDAT", frame.dataParts[j]));
            }
            db.append(postData);
            img.src = db.getUrl("image/png");
            delete frame.dataParts;
        }
        return d.promise();
    };

    var animate = function(aPng, canvas) {
        var ctx = canvas.getContext('2d');
        var fNum = 0;
        var prevF = null;
        var tick = function() {
            var f = fNum++ % aPng.frames.length;
            var frame = aPng.frames[f];

            if (f == 0) {
                ctx.clearRect(0, 0, aPng.width, aPng.height);
                prevF = null;
                if (frame.disposeOp == 2) frame.disposeOp = 1;
            }

            if (prevF && prevF.disposeOp == 1) {
                ctx.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);
            } else if (prevF && prevF.disposeOp == 2) {
                ctx.putImageData(prevF.iData, prevF.left, prevF.top);
            }
            prevF = frame;
            prevF.iData = null;
            if (prevF.disposeOp == 2) prevF.iData = ctx.getImageData(frame.left, frame.top, frame.width, frame.height);
            if (frame.blendOp == 0) ctx.clearRect(frame.left, frame.top, frame.width, frame.height);
            ctx.drawImage(frame.img, frame.left, frame.top);

            if (aPng.numPlays == 0 || fNum / aPng.frames.length < aPng.numPlays) {
                setTimeout(tick, frame.delay);
            }
        };
        tick();
    };

})();
