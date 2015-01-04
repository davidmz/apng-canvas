"use strict";

var Promise = Promise || require('es6-promise').Promise;

module.exports = function (url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                reject(this);
            }
        };
        xhr.send();
    });
};
