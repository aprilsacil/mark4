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
  Generated class for the Central Bluetooth Low Energy provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var CentralBle = (function () {
    function CentralBle(events) {
        this.events = events;
    }
    CentralBle.prototype.init = function () {
        console.log('Central is ready...');
        var self = this;
        // init the peripherals object
        self.peripherals = {};
        // init ble central
        self.central = BLECentral();
        // debug
        self.central.setDebug(true);
        // on debug
        self.central.onDebug(function (message) {
            console.log(message);
        });
        // on subscribe notify
        self.central.onSubscribe(function (response) {
            // notification from server?
            if (response.status === 'subscribedResult') {
                // get encoded data
                var bytes = bluetoothle.encodedStringToBytes(response.value);
                // get the string
                var string = bluetoothle.bytesToString(bytes);
                console.log('Notify: ' + string);
                console.log('Notify Bytes: ' + bytes);
                // create an event
                self.events.publish('central:buyersNearby', string);
            }
        });
        // start scanning for peripherals
        // setTimeout(() => {
        //     self.scan();
        // }, 2000);
    };
    /**
     * Start scanning for devices
     */
    CentralBle.prototype.scan = function () {
        var self = this;
        console.log('scanning');
        // start scanning
        self.central.scan(function (response) {
            // peripheral result?
            if (response.status === 'scanResult') {
                // maximum rssi?
                if (Math.abs(response.rssi) >= Math.abs(self.central.RSSI_MAX)) {
                    console.log('Device too far away...');
                }
                // update peripherals
                self.peripherals = self.handleScan(response);
            }
        }, function (response) {
        });
        this.scanTimeout = setTimeout(function () {
            // stop the scan
            self.central.stopScan(function (response) {
                // update peripheral list
                self.updatePeripheralList(self.peripherals);
                // connect to peripheral
                self.connectToPeripherals(self.peripherals);
                self.stopScanTimeout = setTimeout(function () {
                    self.scan();
                }, 10000);
            });
        }, 2000);
        return this;
    };
    /**
     * Handle scan results
     */
    CentralBle.prototype.handleScan = function (peripheral) {
        var self = this;
        peripheral.rssi = null;
        // peripheral exists?
        if (!(peripheral.name in this.peripherals)) {
            // set peripheral key
            self.peripherals[peripheral.name] = {};
            // set peripheral info
            self.peripherals[peripheral.name].info = peripheral;
            // set peripheral status
            self.peripherals[peripheral.name].status = 'disconnected';
            // set peripheral timestamp
            self.peripherals[peripheral.name].added = Date.now();
            // set peripheral expire
            self.peripherals[peripheral.name].expire = Date.now() + (60000 * 5);
            return self.peripherals;
        }
        // peripheral exists?
        if (peripheral.name in self.peripherals) {
            // get the original
            var original = JSON.stringify(self.peripherals[peripheral.name].info);
            // get the recent
            var recent = JSON.stringify(peripheral);
            // has the same info?
            if (recent === original) {
                // nothing to do
                return self.peripherals;
            }
            else {
                console.log('Device information updated.');
                // is it expired?
                if (this.peripherals[peripheral.name].expire <= Date.now()) {
                    // remove the peripheral
                    delete self.peripherals[peripheral.name];
                    return self.peripherals;
                }
                // set peripheral info
                self.peripherals[peripheral.name].info = peripheral;
            }
            return self.peripherals;
        }
    };
    /**
     * Connect to peripherals
     */
    CentralBle.prototype.connectToPeripherals = function (list) {
        var self = this;
        // do we have peripherals?
        if (JSON.stringify(self.peripherals) === '{}') {
            console.log('No peripherals found.');
            return;
        }
        // device length
        var max = self.objLength(list);
        var index = 0;
        // iterate on each peripherals
        for (var i in list) {
            // connect to peripheral
            (function (i, list, peripherals) {
                self.central.connect(list[i].info.address, 
                // on success connection / disconnect
                function (response) {
                    // set device status
                    peripherals[i].status = response.status;
                    // set device information
                    peripherals[i].device = response.info;
                    // are we good?
                    if (index === max) {
                        // update device list
                        self.updatePeripheralList(peripherals);
                    }
                }, 
                // on error processing connection
                function (response) {
                    peripherals[i].status = 'error';
                    // are we good?
                    if (index === max) {
                        // update peripheral list
                        self.updatePeripheralList(peripherals);
                    }
                });
                index = index + 1;
            })(i, list, self.peripherals);
        }
    };
    /**
     * Update peripheral list
     */
    CentralBle.prototype.updatePeripheralList = function (peripherals) {
        // trigger event
        this.events.publish('central:getPeripherals', peripherals);
        // do we have peripherals?
        if (JSON.stringify(peripherals) === '{}') {
            // TODO: tell that there no available peripherals
            console.log('No available peripherals');
            return;
        }
        // get the peripheral template
        // var baseTpl  = peripheralTpl.innerHTML;
        // combined template
        // var combined = '';
        // iterate on each peripherals
        for (var i in peripherals) {
            console.log(peripherals[i]);
        }
        // update peripheral container
        // peripheralContainer.innerHTML = combined;
        return;
    };
    CentralBle.prototype.write = function (data) {
        var self = this;
        var message = data;
        // prompt for message
        // var message = prompt('Enter your message: ');
        // get the address
        // var address         = e.getAttribute('data-id');
        // var address = self.peripherals[0].info.address;
        // get the information
        var information;
        // look for that id
        for (var i in self.peripherals) {
            // matched the id?
            // if(self.peripherals[i].info.address === address) {
            // get the information
            information = self.peripherals[i];
        }
        console.log('device', information);
        // get the services
        var services = information.device.services;
        // look for our service
        var service;
        for (var i in services) {
            var uuid = services[i].uuid;
            if (uuid === '1000') {
                service = services[i];
            }
        }
        // var foo = {
        //     _id: '12345678890',
        //     name: 'Long Name',
        //     message: 'Lorem ipsum sit dolor amit 1.',
        //     message2: 'Lorem ipsum sit dolor amit 2.',
        //     message3: 'Lorem ipsum sit dolor amit 3.',
        //     message4: 'Lorem ipsum sit dolor amit 4.',
        //     message5: 'Lorem ipsum sit dolor amit 5.',
        //     message6: 'Lorem ipsum sit dolor amit 6.',
        //     message7: 'Lorem ipsum sit dolor amit 7.',
        //  };
        // message = JSON.stringify(foo);
        // set request params
        var param = {
            'address': information.info.address,
            'service': service.uuid,
            'characteristic': service.characteristics[0].uuid,
            'type': 'noResponse',
            'value': message
        };
        self.central.writeByChunk(param, function (response) {
            console.log('write', response);
        }, function (response) {
        });
    };
    /**
     * Object length helper
     */
    CentralBle.prototype.objLength = function (object) {
        var len = 0;
        for (var i in object) {
            len = len + 1;
        }
        return len;
    };
    /**
     * Stops the ongoing scan
     */
    CentralBle.prototype.stop = function () {
        var self = this;
        clearTimeout(self.scanTimeout);
        clearTimeout(self.stopScanTimeout);
        self.central.stopScan(function (response) {
            console.log(response);
        });
    };
    CentralBle = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [ionic_angular_1.Events])
    ], CentralBle);
    return CentralBle;
}());
exports.CentralBle = CentralBle;
