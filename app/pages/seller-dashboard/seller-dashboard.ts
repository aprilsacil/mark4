import { Component, Inject } from '@angular/core';
import { Events, Modal, NavController, ViewController } from 'ionic-angular';
import { SellerAssociatesPage } from '../seller-associates/seller-associates';
import { SellerEmoteModalPage } from '../seller-emote-modal/seller-emote-modal';
import { SellerShopperViewPage } from '../seller-shopper-view/seller-shopper-view';
import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
  providers: [LocalStorageProvider]
})
export class SellerDashboardPage {
    user: Object = {};
    shoppers = [];
    scanning: boolean = false;

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private view: ViewController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        this.scanning = false;

        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
        });
    }

    getNearbyShopperDevices() {
        // initialize the event to listen
        this.events.subscribe('central:buyersNearby', (eventData) => {
            var buyer = JSON.parse(eventData[0]);

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
                            index = 0;
                            break;
                        }
                    }

                    // update
                    this.shoppers[index] = buyer;
                }
            }

            // no shoppers, just push it
            if (!this.shoppers) {
                this.shoppers.push(buyer);
            }
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
        let modal = Modal.create(SellerEmoteModalPage);

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

            // stop the scan
            this.events.publish('central:stopScan');
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
