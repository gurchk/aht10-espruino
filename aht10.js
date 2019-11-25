/* Copyright (c) 2014 Gustav Karlström. See the file LICENSE for copying permission. */
/*
Quick description of my module...
*/

var C = {
  ahtAddress : 0x38,
  sensorCalibrateCmd: [0xE1, 0x08, 0x00],
  sensorMeasureCmd: [0xAC, 0x33, 0x00],
  bytesInAMebibyte: 1048576,
  getRHCmd: true,
  getTempCmd: false,
  waterVapor: 17.62,//f
  barometricPressure: 243.5 //f
};

function AHT10(pin1,pin2) {
    this.pin1 = pin1;
    this.pin2 = pin2;

    i2c.setup({ scl: NodeMCU.D2, sda: NodeMCU.D1, bitrate: 300000 });
    i2c.writeTo(AHT_address, sensorCalibrateCmd);
    setTimeout(() => {
        if ((readStatus() & 0x68) === 0x08) {
            console.log('Success');
        } else {
            console.log('Failure');
        }
    }, 500);
}

/** 'public' constants here */
// MOD123.prototype.C = {
//   MY : 0x013,         // description
//   PUBLIC : 0x0541,    // description
//   CONSTANTS : 0x023   // description
// };

/** Put most of my comments outside the functions... */
MOD123.prototype.foo = function() {
  // you can use C.PRIVATE
  // or this.C.PUBLIC
};

/** Put most of my comments outside the functions... */
MOD123.prototype.bar = function() {
};

/** This is 'exported' so it can be used with `require('MOD123.js').connect(pin1,pin2)` */
exports.connect = function (pin1, pin2) {
  return new AHT10(pin1, pin2);
};

const AHT_address = 0x38;
const i2c = new I2C();
const sensorCalibrateCmd = ;
const sensorMeasureCmd = [0xAC, 0x33, 0x00];
const getRHCmd = true;
const getTempCmd = false;
const bytesInAMebibyte = 1048576;
const waterVapor = 17.62;//f
const barometricPressure = 243.5;//f

function getRawSensorData(getDataCmd) {
    i2c.writeTo(AHT_address, sensorMeasureCmd);
    const dataFromSensor = i2c.readFrom(AHT_address, 6);
    if (getDataCmd) {
        return ((dataFromSensor[1] << 16) | (dataFromSensor[2] << 8) | dataFromSensor[3]) >> 4;
    }
    return ((dataFromSensor[3] & 0x0F) << 16) | (dataFromSensor[4] << 8) | dataFromSensor[5];
}

function setup() {
    i2c.setup({ scl: NodeMCU.D2, sda: NodeMCU.D1, bitrate: 300000 });
    i2c.writeTo(AHT_address, sensorCalibrateCmd);
    setTimeout(() => {
        if ((readStatus() & 0x68) === 0x08) {
            console.log('Success');
        } else {
            console.log('Failure');
        }
    }, 500);
}

function readStatus() {
    return i2c.readFrom(AHT_address, 1);
}

function getTemperature() {
    const rawData = getRawSensorData(getTempCmd);
    return ((200 * rawData) / bytesInAMebibyte) - 50;
}
:
function getHumidity() {
    const rawData = getRawSensorData(getRHCmd);
    if (rawData === 0) {
        return 0;
    }
    return rawData * 100 / bytesInAMebibyte;
}

function getDewPoint() {
    const humidity = getHumidity();
    const temperature = getTemperature();
    const gamma = Math.log(humidity / 100) + waterVapor * temperature / (barometricPressure + temperature);
    const dewPoint = barometricPressure * gamma / (waterVapor - gamma);
    return dewPoint;
}

setup();

setTimeout(() => {
    console.log(getTemperature());
}, 1000);


setTimeout(() => {
    console.log(getHumidity());
}, 2000);


setTimeout(() => {
    console.log(getDewPoint());
}, 3000);

/*

function start(){
 // write some text
 g.drawString("Hello World!",2,2);
 // write to the screen
 g.flip();
}

// I2C
I2C1.setup({scl:B6,sda:B7});
var g = require("SSD1306").connect(I2C1, start);
*/