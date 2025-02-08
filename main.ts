//%block="Emakefun"
namespace emakefun {
    /**
     * Driver for the vk16k33 LED matrix display.
     */

    /**
     * Blinking rate options.
     */
    export const enum blinkRate {
        //% block="Off"
        blinkOff = 0,
        //% block="2 Hz"
        twoHz = 1,
        //% block="1 Hz"
        oneHz = 2,
        //% block="0.5 Hz"
        halfHz = 3,
    }

    /**
     * Base options.
     */
    export const enum base {
        //% block="Binary"
        binary = 2,
        //% block="Octal"
        octal = 8,
        //% block="Decimal"
        decimal = 10,
        //% block="Hexadecimal"
        hexadecimal = 16,
    }

    /**
     * Create a new instance of the vk16k33 driver.
     * @param i2c_address optional I2C address, defaults to 0x70
     * @return the new driver instance
     */
    //% block="create vk16k33 with i2c address $i2c_address"
    //% subcategory="vk16k33"
    //% blockSetVariable=vk16k33
    //% i2c_address.defl=0x70
    //% blockGap=8
    //% weight=100
    //% inlineInputMode=inline
    export function createVk16k33(i2c_address: number = 0x70): vk16k33 {
        return new vk16k33(i2c_address);
    }
    export class vk16k33 {
        private static readonly g_number_table = [
            0x3F, /* 0 */
            0x06, /* 1 */
            0x5B, /* 2 */
            0x4F, /* 3 */
            0x66, /* 4 */
            0x6D, /* 5 */
            0x7D, /* 6 */
            0x07, /* 7 */
            0x7F, /* 8 */
            0x6F, /* 9 */
            0x77, /* a */
            0x7C, /* b */
            0x39, /* C */
            0x5E, /* d */
            0x79, /* E */
            0x71, /* F */
        ]

        private static readonly HT16K33_CMD_BLINK = 0x80;
        private static readonly HT16K33_BLINK_DISPLAY_ON = 0x01;
        private static readonly HT16K33_CMD_BRIGHTNESS = 0xE0;

        private static readonly DIGIT_NUMBER = 4;
        private static readonly COLON_BUFFER_POSITION = 2;
        private readonly i2c_address: number = undefined;
        private display_buffer_: number[] = [0, 0, 0, 0, 0];

        /**
     * Constructor
     * @param i2c_address I2C address of the module, default 0x70
     */
        constructor(i2c_address: number = 0x70) {
            this.i2c_address = i2c_address;
            pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<B', [0x21]));
            this.setBlinkRate(blinkRate.blinkOff);
            this.setBrightness(14);
            this.clear();
            this.Display();
        }

        /**
     * Clear the display.
     */
        //% block="$this clear the display"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% weight=100
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        clear() {
            this.display_buffer_ = [0, 0, 0, 0, 0];
            this.Display();
        }
        Display() {

            for (let i = 0; i < 5; i++) {
                pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<BBB', [0x00 + i * 2, this.display_buffer_[i] & 0xFF, this.display_buffer_[i] >> 8]));
            }
        }

        /**
     * Set the blink rate.
     * @param rate the blink rate, eg: blinkRate.twoHz
     */
        //% block="$this set blink rate to $rate"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% rate.defl=blinkRate.blinkOff
        //% weight=90
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        setBlinkRate(rate: blinkRate) {
            pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<B', [vk16k33.HT16K33_CMD_BLINK | vk16k33.HT16K33_BLINK_DISPLAY_ON | (rate << 1)]));
        }

        /**
     * Set the brightness.
     * @param brightness the brightness, eg: 14
     */
        //% block="$this set brightness to $brightness"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% brightness.min=0 brightness.max=15 brightness.defl=14
        //% weight=80
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        setBrightness(brightness: number) {
            pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<B', [vk16k33.HT16K33_CMD_BRIGHTNESS | brightness]));
        }

        /**
     * Show a colon.
     * @param show true to show a colon, false to hide it
     */
        //% block="$this show colon $show"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% show.defl=true
        //% weight=70
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        showColon(show: boolean) {
            this.display_buffer_[2] = (show ? 1 : 0) << 1;
            pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<BBB', [0x04, this.display_buffer_[2] & 0xFF, this.display_buffer_[2] >> 8]));
        }

        /**
     * Show a digit number.
     * @param index the index of the digit, eg: 0
     * @param number the number to show, eg: 10
     * @param dot true to show a dot, false to hide it
     */
        //% block="$this show digit number $index to $number with dot $dot"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% index.min=0 index.max=3 index.defl=0
        //% number.min=0 number.max=9999 number.defl=10
        //% dot.defl=true
        //% weight=60
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        showDigitNumber(index: number, number: number, dot: boolean) {
            if (index >= vk16k33.DIGIT_NUMBER || number >= base.hexadecimal) return;
            if (index >= vk16k33.COLON_BUFFER_POSITION) index++;
            this.display_buffer_[index] = vk16k33.g_number_table[number] | (dot ? 1 : 0) << 7;
            pins.i2cWriteBuffer(this.i2c_address, Buffer.pack('<BBB', [index << 1, this.display_buffer_[index] & 0xFF, this.display_buffer_[index] >> 8]));
        }

        /**
     * Show a number.
     * @param number the number to show, eg: 100
     * @param Base the base of the number, eg: base.decimal
     * @param fractional_part_digits the number of digits to show in the fractional part, eg: 2
     */
        //% block="$this show number $number in base $Base with $fractional_part_digits fractional digits"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% number.min=-9999 number.max=9999 number.defl=100
        //% Base.defl=base.decimal
        //% fractional_part_digits.min=0 fractional_part_digits.max=4 fractional_part_digits.defl=2
        //% weight=50
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        showNumber(number: number, Base: base = base.decimal, fractional_part_digits: number = 2) {
            let numeric_digits = vk16k33.DIGIT_NUMBER;
            let is_negative = false;
            if (number < 0) {
                --numeric_digits;
                number = -number;
                is_negative = true;
            }
            let limit_value = 1;
            for (let i = 0; i < numeric_digits; ++i) {
                limit_value *= Base;
            }
            let to_int_factor = 1.0;
            for (let i = 0; i < fractional_part_digits; ++i) {
                to_int_factor *= Base;
            }
            let display_number = number * to_int_factor + 0.5;
            while (display_number >= limit_value) {
                --fractional_part_digits;
                to_int_factor /= Base;
                display_number = number * to_int_factor + 0.5;
            }
            if (to_int_factor < 1) {
                this.ShowError();
                return;
            }

            let position = vk16k33.DIGIT_NUMBER;

            for (let i = 0; i <= fractional_part_digits || display_number > 0 || position == vk16k33.DIGIT_NUMBER; i++) {
                let display_decimal = (fractional_part_digits != 0 && i == fractional_part_digits);
                this.display_buffer_[position--] = vk16k33.g_number_table[display_number % Base] | (display_decimal ? 0x80 : 0);
                if (position == vk16k33.COLON_BUFFER_POSITION) {
                    position--;
                }
                display_number /= Base;
            }

            if (is_negative) {
                this.display_buffer_[position--] = 0x40;
            }
            // clear remaining display positions
            while (position >= 0) {
                this.display_buffer_[position--] = 0x00;
            }

            this.Display();
        }

        /**
     * Show an error message.
     */
        //% block="$this show error message"
        //% subcategory="vk16k33"
        //% this.defl=vk16k33
        //% weight=40
        //% blockGap=8
        //% color="#FFA500"
        //% icon="\uf028"
        //% inlineInputMode=inline
        ShowError() {
            for (let i = 0; i < 5; i++) {
                this.display_buffer_[i] = 0x40;
            }
            this.Display();
        }
    }
}