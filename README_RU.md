apng-canvas v2.1.0
==============

Библиотека для отображения Animated PNG ([Wikipedia](http://en.wikipedia.org/wiki/APNG), [стандарт](https://wiki.mozilla.org/APNG_Specification)) 
в браузере при помощи canvas.

Демонстрация: https://davidmz.github.io/apng-canvas/ (3 Mb of apng files)

**Внимание! API версии 2 библиотеки несовместимо с API версии 1!**

Для работы библиотеке требуется поддержка следующих технологий:

 * [Canvas](http://caniuse.com/#feat=canvas)
 * [Typed Arrays](http://caniuse.com/#feat=typedarrays)
 * [Blob URLs](http://caniuse.com/#feat=bloburls)
 * [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)
 
Эти технологии поддерживаются во всех современных браузерах и в IE начиная с версии 10.

Некоторые браузеры (на данный момент это Firefox и Safari 8+) имеют [встроенную поддержку APNG](http://caniuse.com/#feat=apng),
для них использование этой библиотеки не обязательно.

Пример использования
-----------

```javascript
APNG.ifNeeded().then(function() {
    var images = document.querySelectorAll(".apng-image");
    for (var i = 0; i < images.length; i++) APNG.animateImage(images[i]);
});
```

Ограничения
-----------

Изображения загружаются при помощи `XMLHttpRequest`, следовательно, HTML-страница и APNG-картинка должны быть расположены на одном домене,
либо сервер, отдающий картинку, должен отдавать правильный [CORS](http://www.w3.org/TR/cors/ "Cross-Origin Resource Sharing")-заголовок
(например, `Access-Control-Allow-Origin: *`). По той же причине библиотека не будет работать с локальной машины (по протоколу `file://`).

**Важно!** Прокси-сервера, сжимающие трафик (турбо-режим в Опере и Яндекс.Браузере, режим экономии трафика в мобильном Chrome и т. п.), не знают о существовании
формата APNG, и перекодируют его или в статический PNG или в какой-либо другой формат, в результате чего анимация теряется.
Чтобы этого избежать, при отдаче APNG с вашего сайта вы должны использовать HTTP-заголовок `Cache-Control: no-transform` 
(см. [обзорную статью](http://calendar.perfplanet.com/2013/mobile-isp-image-recompression/) по этой теме), 
либо отдавать такие изображения через HTTPS.

API
-----------

Библиотека создаёт глобальный объект **APNG**, имеющий несколько методов.

Высокоуровневые методы:

* [APNG.ifNeeded](API_RU.md#user-content-apngifneededignorenativeapng-boolean)
* [APNG.animateImage](API_RU.md#user-content-apnganimateimageimg-htmlimageelement)
* [APNG.releaseCanvas](API_RU.md#user-content-apngreleasecanvascanvas-htmlcanvaselement)

Низкоуровневые методы:

* [APNG.checkNativeFeatures](API_RU.md#user-content-apngchecknativefeatures)
* [APNG.parseBuffer](API_RU.md#user-content-apngparsebufferdata-arraybuffer)
* [APNG.parseURL](API_RU.md#user-content-apngparseurlurl-string)
* [APNG.animateContext](API_RU.md#user-content-apnganimatecontexturl-string-canvasrenderingcontext2d-context)

Большинство методов работают асинхронно и возвращают объект ES6 *Promise*. Большинство браузеров имеют его [встроенную поддержку](http://caniuse.com/#feat=promises), 
для остальных используется [полифилл](https://github.com/jakearchibald/es6-promise), включённый в библиотеку.
Если вы не работали раньше с Promises, то вам поможет [обзорная статья](http://www.html5rocks.com/en/tutorials/es6/promises/) об этой технологии. В описании методов приводятся
значения результата-Promise в случае его выполнения (filfilled) или отказа (rejected).

Сборка
-----------

    npm install
    gulp build