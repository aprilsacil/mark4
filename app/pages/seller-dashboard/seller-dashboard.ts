import { Component } from '@angular/core';
import { Modal, NavController, ViewController } from 'ionic-angular';
import { SellerAssociatesPage } from '../seller-associates/seller-associates';
import { SellerEmoteModalPage } from '../seller-emote-modal/seller-emote-modal';
import { SellerShopperViewPage } from '../seller-shopper-view/seller-shopper-view';
import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';
import { CentralBle } from '../../providers/bluetooth/central-ble';

/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
  providers: [CentralBle]
})
export class SellerDashboardPage {
    shoppers: Object = {};
    scanning: boolean;

    constructor(
        private centralBle: CentralBle,
        private nav: NavController,
        private view: ViewController
    ) {
        this.scanning = false;
    }

    getNearbyShopperDevices() {

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
    goToShopperDetails() {
        this.nav.push(SellerShopperViewPage);
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

    toggleScan() {
        var self = this;

        // check if we're scanning
        if (self.scanning) {
            // currently scanning, so we're going to stop it
            // flag that we're stopped scanning
            this.scanning = false;

            // stop the scan
            // this.centralBle.stopScan();
            return;
        }

        // flag that we're scanning
        this.scanning = true;

        // scan
        // this.centralBle.scan();

        // get the list of shoppers detected
        this.getNearbyShopperDevices();
        return;
    }
}
