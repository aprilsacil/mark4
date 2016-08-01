import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

declare var bluetoothle: any;
declare var BLEPeripheral: any;

/*
  Generated class for the Peripheral Bluetooth Low Energy provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PeripheralBle {
    private advertising: any;
    private advertiseData: any;
    private central: any;
    private peripheral: any;

    constructor(private events: Events) {
        // listen for this event
        this.events.subscribe('peripheral:set_buyer_data', (eventData) => {
            console.log('event: peripheral data', eventData);

            // TODO: get data coordinates from local storage

            this.advertiseData = eventData[0];
        });
    }

    init() {
        console.log('Starting peripheral process.');

        // init ble peripheral
        this.peripheral = BLEPeripheral();

        // set debug
        this.peripheral.setDebug(true);

        // init advertise
        this.advertising = setInterval(() => {
            console.log('advertising...');
            this.advertise();
        }, 5000);

        // on debug
        this.peripheral.onDebug((message) => {
            // log message
            console.log(message);
        });

        // on peripheral callback
        this.peripheral.onInitPeripheral((response) => {
            // if we are connected
            if(response.status === 'connected') {
                this.central = response;

                // central device name set?
                response.name = response.name ? response.name : response.address;

                // get response
                this.central = response;

                // update central list
                this.updateCentralList(this.central);

                // stop advertising this device
                clearInterval(this.advertising);

                return;
            }

            // write request?
            if (response.status === 'writeRequested') {
                console.log('write requested', response);

                // get encoded data
                var bytes  = bluetoothle.encodedStringToBytes(response.value);
                // get the string
                var string = bluetoothle.bytesToString(bytes);

                console.log('Write: ' + string);
                console.log('Write Bytes: ' + bytes);

                // trigger an event
                this.events.publish('peripheral:buyers_nearby', string);
            }

            // subscription?
            if (response.status === 'subscribed') {
                // set subscription data
                this.central.subscribe = response;

                // once the central is now subscribed, let's send a notify
                this.sendNotifyData();

                console.log(this.central.address + ' has been subscribed.');
            }

            // disconnection?
            if(response.status === 'disconnected') {
                this.central = {};

                // update list
                this.updateCentralList(this.central);

                // update status
                this.updatePeripheralStatus({});

                // restart interval
                clearInterval(this.advertising);

                // start interval
                this.advertising = setInterval(() => {
                    this.advertise();
                }, 10000);

                return;
            }
        });
    }

    /**
     * Start advertising
     */
    advertise() {
        // start advertising
        this.peripheral.advertise((response) => {
            console.log('advertise', response);

            // advertising started?
            if(response.status === 'advertisingStarted') {
                // update peripheral information
                this.updatePeripheralStatus(response);
            }
        }, (response) => {
            console.log('Error occur while advertising device: ' + response.message);
        });
    }

    /**
     * Sends a notify to the central
     */
    notify(message) {
        var self = this;

        // set request params
        var param = {
            'address'           : self.central.address,
            'service'           : self.central.subscribe.service,
            'characteristic'    : self.central.subscribe.characteristic,
            'value'             : message
        };

        self.peripheral.notifyByChunk(param, function(response) {
            console.log('notify by chunk:' , response);
        }, function(response) {
            console.log('notify by chunk error:', response);
        });
    }

    /**
     * Update central list
     */
    updateCentralList(central) {
        // do we have central?
        if(JSON.stringify(central) === '{}') {
            // no central device
            console.log('No available central device');
            return this;
        }

        // details of the central thingy
        console.log('device: ', central);
        return this;
    }

    /**
     * Update peripheral status
     */
    updatePeripheralStatus(data) {
        // do we have a status?
        if(JSON.stringify(data) === '{}') {
            // no peripheral status
            console.log('No peripheral status');
            return;
        }

        // peripheral status
        console.log('peripheral status', data);
    }

    /**
     * Stops the peripheral processes
     */
    stop() {
        clearInterval(this.advertising);

        // stop advertising
        this.peripheral.stopAdvertising((response) => {
            console.log('stop advertising', response);
        });

        // remove services
        this.peripheral.removeAllServices((response) => {
            console.log('remove all services', response);
        });
    }

    /**
     * Notifies the subscribe central device.
     */
    sendNotifyData() {
        var self = this;

        if (!self.advertiseData) {
            return;
        }

        // notify
        self.notify(self.advertiseData);
    }
}
