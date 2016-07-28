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

                        exists = true;
                        break;
                    }
                }
            }

            // no shoppers, just push it
            if (!self.shoppers.length || !exists) {
                var text = buyer.fullname;

                self.zone.run(() => {
                    self.shoppers.push(buyer);

                    text = (buyer.looking_for) ?
                        text + ' is looking for "' + buyer.looking_for +'"':
                        text + ' is nearby and looking for something.';

                    self.events.publish('app:local_notifications', {
                        title: 'There is a buyer nearby!',
                        text: text
                    })
                });
            }

            console.log(self.shoppers);
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
            this.events.publish('central:stop_scan');

            // unsubscribe event
            this.events.unsubscribe('central:buyers_nearby', () => {});
            return;
        }

        // flag that we're scanning
        this.scanning = true;

        // scan
        this.events.publish('central:start_scan');

        // get the list of shoppers detected
        this.getNearbyShopperDevices();
        return;
    }
}
