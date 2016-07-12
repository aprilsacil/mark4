import { Component } from '@angular/core';
import { Alert, NavController } from 'ionic-angular';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';

/*
  Generated class for the SellerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-signup/seller-signup.html',
})
export class SellerSignupPage {
    seller: Object = {};

    constructor(private nav: NavController) {}

    /**
     * Redirects to the buyer
     */
    goToBuyerSignupPage() {
        this.nav.push(BuyerSignupPage);
    }

    /**
     * Validates and submits the data of the seller.
     */
    submitSellerForm(sellerForm) {

    }
}
