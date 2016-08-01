import { Component, Inject, NgZone } from '@angular/core';
import { Alert, Events, Modal, NavController, ViewController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

import { SellerAssociatesPage } from '../seller-associates/seller-associates';
import { SellerEmoteModalPage } from '../seller-emote-modal/seller-emote-modal';
import { SellerShopperViewPage } from '../seller-shopper-view/seller-shopper-view';
import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';

import { Diagnostics } from '../../providers/diagnostics/diagnostics';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';
import { DistanceCalculator } from '../../components/distance-calculator/distance-calculator';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
  directives: [CheersAvatar, DistanceCalculator],
  providers: [Diagnostics, LocalStorageProvider]
})
export class SellerDashboardPage {
    coordinates: any;
    user: any;
    shoppers = [];
    scanning: boolean = false;

    constructor(
        private diagnostics: Diagnostics,
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private view: ViewController,
        private zone: NgZone,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        this.scanning = false;

        // get user details
        this.getUser();

        // listens for changes in the user details
        this.events.subscribe('user:update_details', () => {
            // get user details again from the local storage
            this.getUser();
        });

        // get coordinates from local storage
        this.localStorage.getFromLocal('coordinates').then(coordinates => {
            if (coordinates) {
                // parse it because it is saved in JSON.stringify
                this.coordinates = JSON.parse(coordinates);
                return;
            }

            // no coordinates, get it!
            Geolocation.getCurrentPosition().then((response) => {
                this.coordinates = response.coords;
            });
        })

    }

    /**
     * Checks for inactive shoppers.
     */
    checkForInactiveShoppers() {
        var currentTimestamp = Math.round(new Date().getTime() / 1000),
            shoppers         = this.shoppers;

        console.log('checking...');

        if (!shoppers.length) {
            return;
        }

        // loop
        for (var s in shoppers) {
            var index = this.shoppers.indexOf(shoppers[s]);

            // check the timestamp
            if (shoppers[s].timestamp) {
                var difference = currentTimestamp - shoppers[s].timestamp;

                // check if the shopper is inactive for almost 5 minutes
                if (difference > 60) {
                    // remove from the list
                    this.shoppers.splice(index, 1);
                }

                return;
            }

            // no timestamp, auto remove
            this.shoppers.splice(index, 1);
        }
    }

    /**
     * Listens to an event triggered by the central ble library to get nearby
     * peripheral devices details and render it to the app.
     */
    getNearbyShopperDevices() {
        var self = this;

        // initialize the event to listen
        self.events.subscribe('central:buyers_nearby', (eventData) => {
            var exists    = false,
                buyer     = JSON.parse(eventData[0]);

            // check if there's really a data
            if (!buyer) {
                return;
            }

            buyer = new Buyer(buyer);

            // add timestamp
            buyer.timestamp = eventData[1];

            // check if the buyer already exists in the object
            if (self.shoppers || self.shoppers.length !== 0) {
                // check if the shopper already exists
                for (var s in self.shoppers) {
                    // check if the ids are the same
                    if (self.shoppers[s]._id == buyer._id) {
                        // update the object
                        self.zone.run(() => {
                            self.shoppers[s] = buyer;
                        });

                        // flag that the incoming buyer data already exists
                        exists = true;
                        break;
                    }
                }
            }

            // no shoppers, just push it
            if (!self.shoppers.length || !exists) {
                var text = buyer.fullname;

                // update
                self.zone.run(() => {
                    self.shoppers.push(buyer);

                    // prepare the text for the notification
                    text = (buyer.looking_for) ?
                        text + ' is looking for "' + buyer.looking_for +'"':
                        text + ' is nearby and looking for something.';

                    // notify!
                    self.events.publish('app:local_notifications', {
                        title: 'There is a buyer nearby!',
                        text: text
                    })
                });
            }

            console.log('list of shoppers', self.shoppers);
        });
    }

    /**
     * Get user data from the local storage
     */
    getUser() {
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = new Seller(JSON.parse(data));
        });
    }

    /**
     * Goes to the associates page
     */
    goToAssociatesPage() {
        this.nav.push(SellerAssociatesPage);
    }

    /**
     * Views the details of the shopper
     */
    goToShopperDetails(shopper) {
        this.nav.push(SellerShopperViewPage, { shopper : shopper });
    }

    /**
     * Goes to update settings page
     */
    goToUpdateSettingsPage() {
        this.nav.push(SellerUpdateSettingsPage);
    }

    /**
     * Show the Emote modal
     */
    showEmoteModal() {
        // initialize the modal
        var modal = Modal.create(SellerEmoteModalPage);

        // render
        this.nav.present(modal);
    }

    /**
     * Will start or stop the scanning of devices nearby the user.
     */
    toggleScan() {
        var self = this,
            inactiveChecker;

        // check if we're not scanning
        if (!self.scanning) {
            // check if bluetooth and location services are enabled
            self.diagnostics.bluetoothLocationServices().then(response => {
                // flag that we're scanning
                self.scanning = true;

                // scan
                self.events.publish('central:start_scan');

                // get the list of shoppers detected
                self.getNearbyShopperDevices();

                // this.events.publish('central:buyers_nearby', '{"_id":"org.couchdb.user:johnbuyer","fullname":"John Buyer","name":"johnbuyer","job_description":null,"company_name":null,"level":0}', Math.round(new Date().getTime() / 1000));

                // create an interval every 20 seconds to check if the shoppers are inactive
                inactiveChecker = setInterval(() => {
                    self.checkForInactiveShoppers();
                }, 20000);
                return;
            }, response => {
                // check if the bluetooth is not enabled
                if (response.tool == 'bluetooth' && !response.enabled) {
                    var alert = Alert.create({
                        title: 'Bluetooth is turned off',
                        message: 'Please enable bluetooth to detect nearby buyers.',
                        buttons: ['OK']
                    });

                    // render
                    self.nav.present(alert);
                    return;
                }

                // check if location services is enabled
                if (response.tool == 'location_services' && !response.enabled) {
                    var alert = Alert.create({
                        title: 'Location Services is turned off',
                        message: 'Please enable location services to detect nearby buyers.',
                        buttons: ['OK']
                    });

                    // render
                    self.nav.present(alert);
                    return;
                }
            });

            return;
        }

        // currently scanning, so we're going to stop it
        // flag that we're stopped scanning
        this.scanning = false;

        // clear interval
        clearInterval(inactiveChecker);

        // empty out the shoppers
        this.shoppers = [];

        // stop the scan
        this.events.publish('central:stop_scan');

        // unsubscribe event
        this.events.unsubscribe('central:buyers_nearby', () => {});
        return;
    }
}
