import { Component, Inject, NgZone } from '@angular/core';
import { Events, Modal, NavController, ViewController } from 'ionic-angular';

import { SellerAssociatesPage } from '../seller-associates/seller-associates';
import { SellerEmoteModalPage } from '../seller-emote-modal/seller-emote-modal';
import { SellerShopperViewPage } from '../seller-shopper-view/seller-shopper-view';
import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
  directives: [CheersAvatar],
  providers: [LocalStorageProvider]
})
export class SellerDashboardPage {
    user: any;
    shoppers = [];
    scanning: boolean = false;

    constructor(
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
    }

    /**
     * Listens to an event triggered by the central ble library to get nearby
     * peripheral devices details and render it to the app.
     */
    getNearbyShopperDevices() {
        // initialize the event to listen
        this.events.subscribe('central:buyersNearby', (eventData) => {
            var buyer = JSON.parse(eventData[0]);
            buyer = new Buyer(buyer);

            // check if the buyer already exists in the object
            if (this.shoppers) {
                var existing = this.shoppers.some((element) => {
                    return (element._id === buyer._id) ? element : false;
                });

                // if it doesn't exists, push it
                if (!existing) {
                    this.shoppers.push(buyer);
                }

                // if it exists, update the current data
                if (existing) {
                    var index;

                    // get the index of the shopper by looping all the shoppers
                    for (var s in this.shoppers) {
                        if (this.shoppers[s]._id == buyer._id) {
                            index = s;
                            break;
                        }
                    }

                    // update
                    this.zone.run(() => {
                        this.shoppers[index] = buyer;
                    });
                }
            }

            // no shoppers, just push it
            if (!this.shoppers) {
                this.zone.run(() => {
                    this.shoppers.push(buyer);
                });
            }

            console.log(this.shoppers);
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
        var self = this;

        // check if we're scanning
        if (self.scanning) {
            // currently scanning, so we're going to stop it
            // flag that we're stopped scanning
            this.scanning = false;

            // empty out the shoppers
            this.shoppers = [];

            // stop the scan
            this.events.publish('central:stopScan');

            // unsubscribe event
            this.events.unsubscribe('central:buyersNearby', () => {});
            return;
        }

        // flag that we're scanning
        this.scanning = true;

        // scan
        this.events.publish('central:startScan');

        // get the list of shoppers detected
        this.getNearbyShopperDevices();
        return;
    }
}
