import { Component } from '@angular/core';
import { Modal, NavController, NavParams } from 'ionic-angular';
import { SellerAwardModalPage } from '../seller-award-modal/seller-award-modal';

/*
  Generated class for the SellerShopperViewPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-shopper-view/seller-shopper-view.html',
})
export class SellerShopperViewPage {
    private shopper: Object = {};

    constructor(
        private nav: NavController,
        private params: NavParams
    ) {
        this.shopper = this.params.get('shopper');
    }

    /**
     * Shows the award customer modal
     */
    showAwardModal() {
        // initialize the modal
        var modal = Modal.create(SellerAwardModalPage);

        // render it
        this.nav.present(modal);
    }
}
