import { Component } from '@angular/core';
import { Modal, NavController, ViewController } from 'ionic-angular';
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
    user = { image: <string> null };
    shoppers: Object = {};
    scanning: boolean = false;

    constructor(
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private view: ViewController
    ) {
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
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
}
