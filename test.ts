// tests go here; this will not be compiled when this package is used as an extension.
let Vk16k33 = emakefun.createVk16k33(0x70);
Vk16k33.setBrightness(15);

basic.forever(function () {
    Vk16k33.showColon(true);
    Vk16k33.showDigitNumber(0, 1, false);
    Vk16k33.showDigitNumber(1, 2, true);
    Vk16k33.showDigitNumber(2, 3, false);
    Vk16k33.showDigitNumber(3, 4, true);

    basic.pause(500);
    Vk16k33.clear();
    basic.pause(500);
})