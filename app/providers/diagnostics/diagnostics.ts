import { Injectable } from '@angular/core';
import { Diagnostic } from 'ionic-native';
import 'rxjs/add/operator/map';

/*
  Generated class for the Diagnostics provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Diagnostics {
    constructor() {}

    /**
     * Checks if the bluetooth and location services are enabled.
     */
    bluetoothLocationServices() {
        return new Promise((resolve, reject) => {
            // check if bluetooth is enabled
            Diagnostic.isBluetoothEnabled().then(response => {
                if (!response) {
                    reject({
                        tool: 'bluetooth',
                        enabled: false
                    });
                }

                // check location services
                Diagnostic.isLocationEnabled().then(response => {
                    if (!response) {
                        reject({
                            tool: 'location_services',
                            enabled: false
                        });
                    }

                    resolve({ enabled: true });
                });
            });
        });
    }

    gpsStatus() {
        return new Promise((resolve, reject) => {
            Diagnostic.isGpsLocationEnabled().then(response => {
                console.log('gps', response);
                if (response) {
                    resolve({
                        tool: 'gps',
                        enabled: true
                    });
                }

                if (!response) {
                    reject({
                        tool: 'gps',
                        enabled: false
                    });
                }
            });
        })
    }
}

