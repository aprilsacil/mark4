"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
/*
  Generated class for the Peripheral Bluetooth Low Energy provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var PeripheralBle = (function () {
    function PeripheralBle(events) {
        var _this = this;
        this.events = events;
        // listen for this event
        this.events.subscribe('peripheral:set_buyer_data', function (eventData) {
            console.log('event: peripheral data', eventData);
            _this.advertiseData = eventData[0];
        });
    }
    PeripheralBle.prototype.init = function () {
        var _this = this;
        console.log('Starting peripheral process.');
        // init ble peripheral
        this.peripheral = BLEPeripheral();
        // set debug
        this.peripheral.setDebug(true);
        // init advertise
        this.advertising = setInterval(function () {
            console.log('advertising...');
            _this.advertise();
        }, 5000);
        // on debug
        this.peripheral.onDebug(function (message) {
            // log message
            console.log(message);
        });
        // on peripheral callback
        this.peripheral.onInitPeripheral(function (response) {
            console.log('initialize peripheral response', response);
            // if we are connected
            if (response.status === 'connected') {
                _this.central = response;
                // central device name set?
                response.name = response.name ? response.name : response.address;
                // get response
                _this.central = response;
                // update central list
                _this.updateCentralList(_this.central);
                // stop advertising this device
                clearInterval(_this.advertising);
                return;
            }
            // write request?
            if (response.status === 'writeRequested') {
                console.log('write requested', response);
                // get encoded data
                var bytes = bluetoothle.encodedStringToBytes(response.value);
                // get the string
                var string = bluetoothle.bytesToString(bytes);
                console.log('Write: ' + string);
                console.log('Write Bytes: ' + bytes);
                // trigger an event
                _this.events.publish('peripheral:emoteFound', string);
            }
            // subscription?
            if (response.status === 'subscribed') {
                // set subscription data
                _this.central.subscribe = response;
                // once the central is now subscribed, let's send a notify
                if (_this.advertiseData) {
                    _this.notify(JSON.stringify(_this.advertiseData));
                }
                console.log(_this.central.address + ' has been subscribed.');
            }
            // disconnection?
            if (response.status === 'disconnected') {
                _this.central = {};
                // update list
                _this.updateCentralList(_this.central);
                // update status
                _this.updatePeripheralStatus({});
                // restart interval
                clearInterval(_this.advertising);
                // start interval
                _this.advertising = setInterval(function () {
                    _this.advertise();
                }, 10000);
                return;
            }
        });
    };
    /**
     * Start advertising
     */
    PeripheralBle.prototype.advertise = function () {
        var _this = this;
        // start advertising
        this.peripheral.advertise(function (response) {
            console.log('advertise', response);
            // advertising started?
            if (response.status === 'advertisingStarted') {
                // update peripheral information
                _this.updatePeripheralStatus(response);
            }
        }, function (response) {
            console.log('Error occur while advertising device: ' + response.message);
        });
    };
    /**
     * Sends a notify to the central
     */
    PeripheralBle.prototype.notify = function (message) {
        var self = this;
        // set request params
        var param = {
            'address': self.central.address,
            'service': self.central.subscribe.service,
            'characteristic': self.central.subscribe.characteristic,
            'value': message
        };
        console.log('param', param);
        self.peripheral.notifyByChunk(param, function (response) {
            console.log('notify by chunk:', response);
        }, function (response) {
            console.log('notify by chunk error:', response);
        });
    };
    /**
     * Update central list
     */
    PeripheralBle.prototype.updateCentralList = function (central) {
        // do we have central?
        if (JSON.stringify(central) === '{}') {
            // no central device
            console.log('No available central device');
            return this;
        }
        // details of the central thingy
        console.log('device: ', central);
        return this;
    };
    /**
     * Update peripheral status
     */
    PeripheralBle.prototype.updatePeripheralStatus = function (data) {
        // do we have a status?
        if (JSON.stringify(data) === '{}') {
            // no peripheral status
            console.log('No peripheral status');
            return;
        }
        // peripheral status
        console.log('peripheral status', data);
    };
    PeripheralBle.prototype.stop = function () {
        clearInterval(this.advertising);
    };
    PeripheralBle = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [ionic_angular_1.Events])
    ], PeripheralBle);
    return PeripheralBle;
}());
exports.PeripheralBle = PeripheralBle;
